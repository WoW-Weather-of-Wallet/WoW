package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.ChangePasswordRequest;
import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
import com.wow.domain.auth.dto.SignupIdentityCheckRequest;
import com.wow.domain.auth.dto.TokenRefreshResponse;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.auth.dto.UserCreateResponse;
import com.wow.domain.auth.dto.UserIdCheckResponse;
import com.wow.domain.auth.dto.UserLoginRequest;
import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.security.CustomUserDetailsService;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.term.entity.Term;
import com.wow.domain.term.service.TermService;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.constant.ValidationPatterns;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.InvalidTokenException;
import com.wow.global.exception.NotFoundException;
import com.wow.global.exception.RateLimitException;
import com.wow.global.util.PhoneNumberUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    // [added] 이유: 로그인 무차별 대입 공격 방지를 위한 rate limit 상수
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final Duration LOGIN_BLOCK_DURATION = Duration.ofMinutes(15);
    private static final Duration LOGIN_ATTEMPT_WINDOW = Duration.ofMinutes(15);
    // [added] 이유: 로그인 외 공개 인증 API에도 공통 rate limit을 적용하기 위한 제한값
    private static final int MAX_PUBLIC_AUTH_ATTEMPTS = 5;
    private static final Duration PUBLIC_AUTH_BLOCK_DURATION = Duration.ofMinutes(10);
    private static final Duration PUBLIC_AUTH_ATTEMPT_WINDOW = Duration.ofMinutes(10);

    // [added] 이유: enforcePublicRateLimit의 blockKey 조회 → 카운터 증가 TOCTOU 레이스 컨디션 방지를 위한 Lua 스크립트
    private static final DefaultRedisScript<Long> PUBLIC_RATE_LIMIT_SCRIPT = PublicAuthRateLimitScript.create();
    // [fix] 수정 전: checkLoginRateLimit(hasKey) → incrementLoginAttempts(increment) 분리 연산 | 이유: TOCTOU → Lua 스크립트로 원자 처리
    private static final DefaultRedisScript<Long> LOGIN_RATE_LIMIT_SCRIPT = LoginRateLimitScript.create();
    private static final long RATE_LIMIT_BLOCKED = -1L;
    private static final long RATE_LIMIT_EXCEEDED = -2L;

    private final UserRepository userRepository;
    private final UserTermRepository userTermRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final SmsService smsService;
    private final StringRedisTemplate redisTemplate;
    private final CustomUserDetailsService customUserDetailsService;
    private final TermService termService;

    @Transactional(readOnly = true)
    public UserIdCheckResponse checkUserId(String userId) {
        String normalizedUserId = userId == null ? "" : userId.trim();
        if (normalizedUserId.isBlank()) {
            throw new BadRequestException("?ê¾©ì” ?ë¶¾? ?ë‚…ì °?ëŒï¼œ?ëª„ìŠ‚.");
        }
        if (!normalizedUserId.matches(ValidationPatterns.USER_ID)) {
            throw new BadRequestException("?ê¾©ì” ?ë¶¾ë’— ?ê³·Ð¦ ?ëš®Ð¦?ë¨¯? ?ãƒ¬ì˜„ç‘œ??Ñ‹ë¸¿??4???ëŒê¸½ 20???ëŒ„ë¸¯ï§??ÑŠìŠœ?????ë‰ë’¿?ëˆë–Ž.");
        }
        enforcePublicRateLimit(
                RedisKeys.USER_ID_CHECK_ATTEMPT_PREFIX,
                RedisKeys.USER_ID_CHECK_BLOCK_PREFIX,
                normalizedUserId,
                "아이디 중복 확인 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        );
        boolean isAvailable = !userRepository.existsByUserIdOrSsafyOauthId(normalizedUserId, normalizedUserId);
        String message = isAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.";
        return new UserIdCheckResponse(isAvailable, message, normalizedUserId);
    }

    public void checkSignupIdentity(SignupIdentityCheckRequest request) {
        String normalizedName = request.getName().trim();
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsDuplicate(normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new DuplicateException("이미 등록된 회원입니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateException("이미 사용 중인 휴대폰번호입니다.");
        }
    }

    @Transactional
    public UserCreateResponse signup(UserCreateRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();

        if (userRepository.existsByUserIdOrSsafyOauthId(request.getUserId(), request.getUserId())) {
            // [fix] 수정 전: throw new IllegalArgumentException("이미 사용 중인 아이디입니다.") | 이유: 중복은 409 CONFLICT가 적절
            throw new DuplicateException("이미 사용 중인 아이디입니다.");
        }
        // [fix] 수정 전: existsByPhoneNumber → existsDuplicate 순서 | 이유: 이름+성별+생년월일+전화번호 4개 조건이 모두 일치하면 동일인으로 판단하여 먼저 차단,
        //   이후 전화번호만 다른 타인의 번호 중복은 별도 메시지로 구분
        if (userRepository.existsDuplicate(normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new DuplicateException("이미 등록된 회원입니다.");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateException("이미 사용 중인 전화번호입니다.");
        }

        validatePassword(request.getPw(), request.getUserId());
        List<Term> currentRequiredTerms = termService.getCurrentRequiredTerms();

        // [fix] 수정 전: smsService.checkVerified() + try/finally { smsService.deleteVerified() } | 이유: check와 delete가 분리된 Redis 연산으로 레이스 컨디션 → 원자적 checkAndConsume으로 대체
        smsService.checkAndConsumeVerified(phoneNumber);

        User user = User.builder()
                .userId(request.getUserId())
                .ssafyOauthId(null)
                .pw(bCryptPasswordEncoder.encode(request.getPw()))
                .name(normalizedName)
                .gender(request.getGender())
                .phoneNumber(phoneNumber)
                .birthDate(request.getBirthDate())
                .alarmEnabled(request.isAlarmEnabled())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        /*
         * The signup payload still exposes a single boolean, but the screen collects
         * agreement for every required term separately. We therefore interpret
         * termsAgreed=true as "all current required terms were accepted" and persist
         * one user_terms row per active required term.
         */
        saveRequiredTermAgreements(user, currentRequiredTerms);

        return UserCreateResponse.from(user);
    }

    @Transactional
    public UserLoginResponse login(UserLoginRequest request) {
        // [fix] 수정 전: checkLoginRateLimit(hasKey) → 인증 → catch incrementLoginAttempts(increment) 분리 연산
        //   이유: TOCTOU 레이스 컨디션 → enforceLoginRateLimit(Lua Script)로 차단 확인 + 카운터 증가를 원자 처리
        enforceLoginRateLimit(request.getUserId());

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPw())
            );

            // [added] 이유: 로그인 성공 시 실패 카운터 초기화
            resetLoginAttempts(request.getUserId());

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String userId = userDetails.getUsername();
            String accessToken = jwtTokenProvider.createAccessToken(
                    userId,
                    userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList()
            );
            String refreshToken = jwtTokenProvider.createRefreshToken(userId);

            redisTemplate.opsForValue().set(
                    RedisKeys.REFRESH_TOKEN_PREFIX + userId,
                    refreshToken,
                    Duration.ofSeconds(jwtTokenProvider.getRefreshTokenValidityInSeconds())
            );

            return UserLoginResponse.of(
                    accessToken,
                    jwtTokenProvider.getAccessTokenValidityInSeconds(),
                    refreshToken,
                    UserSummaryResponse.from(userDetails)
            );
        } catch (AuthenticationException e) {
            throw e;
        }
    }

    public TokenRefreshResponse refresh(String refreshToken) {
        // [fix] 수정 전: jwtTokenProvider.validateToken(refreshToken) + getUserIdFromToken(refreshToken) (이중 파싱, type 미검증) | 이유: refresh 토큰 type claim 검증 + 단일 파싱으로 개선
        Claims claims;
        try {
            claims = jwtTokenProvider.parseRefreshToken(refreshToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidTokenException("유효하지 않은 refresh token입니다.");
        }

        String userId = claims.getSubject();
        String savedToken = redisTemplate.opsForValue().get(RedisKeys.REFRESH_TOKEN_PREFIX + userId);

        if (!refreshToken.equals(savedToken)) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 토큰 불일치는 401 UNAUTHORIZED가 적절
            throw new InvalidTokenException("refresh token이 일치하지 않습니다.");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String newAccessToken = jwtTokenProvider.createAccessToken(userId, roles);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

        redisTemplate.opsForValue().set(
                RedisKeys.REFRESH_TOKEN_PREFIX + userId,
                newRefreshToken,
                Duration.ofSeconds(jwtTokenProvider.getRefreshTokenValidityInSeconds())
        );

        return new TokenRefreshResponse(
                newAccessToken,
                jwtTokenProvider.getAccessTokenValidityInSeconds(),
                newRefreshToken,
                jwtTokenProvider.getRefreshTokenValidityInSeconds()
        );
    }

    public void logout(String userId) {
        redisTemplate.delete(RedisKeys.REFRESH_TOKEN_PREFIX + userId);
    }

    @Transactional(readOnly = true)
    public FindIdResponse findId(FindIdRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();
        enforcePublicRateLimit(
                RedisKeys.FIND_ID_ATTEMPT_PREFIX,
                RedisKeys.FIND_ID_BLOCK_PREFIX,
                phoneNumber,
                "아이디 찾기 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        );

        User user = userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                        normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("일치하는 회원 정보를 찾을 수 없습니다."));

        if (user.getUserId() == null) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("SSAFY 계정으로 가입된 회원입니다.");
        }

        // [fix] 수정 전: checkVerified + try/finally deleteVerified | 이유: 원자적 checkAndConsume으로 레이스 컨디션 방지
        smsService.checkAndConsumeVerified(phoneNumber);
        return new FindIdResponse(user.getUserId());
    }

    @Transactional
    public void findPassword(FindPwRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();
        enforcePublicRateLimit(
                RedisKeys.FIND_PASSWORD_ATTEMPT_PREFIX,
                RedisKeys.FIND_PASSWORD_BLOCK_PREFIX,
                request.getUserId() + ":" + phoneNumber,
                "비밀번호 재설정 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
        );

        // [fix] 수정 전: findByUserIdAndNameAndBirthDateAndPhoneNumber (gender 없음) | 이유: findId와 동일한 4개 조건으로 본인확인 강도 대칭
        User user = userRepository.findByUserIdAndNameAndGenderAndBirthDateAndPhoneNumber(
                        request.getUserId(), normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("일치하는 회원 정보를 찾을 수 없습니다."));

        // [fix] 수정 전: checkVerified + try/finally deleteVerified | 이유: 원자적 checkAndConsume으로 레이스 컨디션 방지
        smsService.checkAndConsumeVerified(phoneNumber);
        validatePassword(request.getNewPw(), request.getUserId());
        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 회원입니다."));

        if (user.getPw() == null) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        if (!bCryptPasswordEncoder.matches(request.getCurrentPw(), user.getPw())) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("현재 비밀번호가 올바르지 않습니다.");
        }

        validatePassword(request.getNewPw(), userId);
        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));
    }

    // [fix] 수정 전: checkLoginRateLimit(hasKey) + incrementLoginAttempts(increment) 분리 | 이유: TOCTOU → Lua 스크립트로 원자 처리
    private void enforceLoginRateLimit(String userId) {
        String attemptKey = RedisKeys.LOGIN_ATTEMPT_PREFIX + userId;
        String blockKey = RedisKeys.LOGIN_BLOCK_PREFIX + userId;

        Long result = redisTemplate.execute(
                LOGIN_RATE_LIMIT_SCRIPT,
                List.of(attemptKey, blockKey),
                String.valueOf(LOGIN_ATTEMPT_WINDOW.toSeconds()),
                String.valueOf(MAX_LOGIN_ATTEMPTS),
                String.valueOf(LOGIN_BLOCK_DURATION.toSeconds())
        );

        if (result == null || result == RATE_LIMIT_BLOCKED || result == RATE_LIMIT_EXCEEDED) {
            log.warn("로그인 시도 횟수 초과로 계정 차단: userId={}", userId);
            throw new RateLimitException("로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private void resetLoginAttempts(String userId) {
        redisTemplate.delete(RedisKeys.LOGIN_ATTEMPT_PREFIX + userId);
        redisTemplate.delete(RedisKeys.LOGIN_BLOCK_PREFIX + userId);
    }

    // [fix] 수정 전: hasKey(blockKey) → increment(attemptKey) 순서로 별도 연산 수행 | 이유: 동시 요청 시 TOCTOU 레이스 컨디션으로 rate limit 우회 가능 → Lua 스크립트로 원자 처리
    private void enforcePublicRateLimit(
            String attemptPrefix,
            String blockPrefix,
            String identifier,
            String blockMessage
    ) {
        String attemptKey = attemptPrefix + identifier;
        String blockKey = blockPrefix + identifier;

        Long result = redisTemplate.execute(
                PUBLIC_RATE_LIMIT_SCRIPT,
                List.of(attemptKey, blockKey),
                String.valueOf(PUBLIC_AUTH_ATTEMPT_WINDOW.toSeconds()),
                String.valueOf(MAX_PUBLIC_AUTH_ATTEMPTS),
                String.valueOf(PUBLIC_AUTH_BLOCK_DURATION.toSeconds())
        );

        if (result == null || result == RATE_LIMIT_BLOCKED || result == RATE_LIMIT_EXCEEDED) {
            throw new RateLimitException(blockMessage);
        }
    }

    private void saveRequiredTermAgreements(User user, List<Term> requiredTerms) {
        LocalDateTime agreedAt = LocalDateTime.now();
        List<UserTerm> userTerms = requiredTerms.stream()
                .map(term -> UserTerm.builder()
                        .user(user)
                        .term(term)
                        .agreed(true)
                        .agreedAt(agreedAt)
                        .build())
                .toList();
        userTermRepository.saveAll(userTerms);
    }

    private void validatePassword(String pw, String userId) {
        if (pw == null || pw.length() < 8 || pw.length() > 20) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("비밀번호는 8자 이상 20자 이하여야 합니다.");
        }
        if (!pw.matches(".*[A-Z].*")) {
            throw new BadRequestException("비밀번호에는 대문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[a-z].*")) {
            throw new BadRequestException("비밀번호에는 소문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[0-9].*")) {
            throw new BadRequestException("비밀번호에는 숫자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new BadRequestException("비밀번호에는 특수문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (userId != null && userId.equals(pw)) {
            throw new BadRequestException("비밀번호는 아이디와 동일하게 설정할 수 없습니다.");
        }
        if (hasConsecutiveSequence(pw)) {
            throw new BadRequestException("비밀번호에 연속된 문자 또는 숫자 4자 이상을 사용할 수 없습니다.");
        }
        if (hasRepeatedChars(pw)) {
            throw new BadRequestException("비밀번호에 같은 문자 또는 숫자 4자 이상을 반복할 수 없습니다.");
        }
    }

    private boolean hasConsecutiveSequence(String pw) {
        String lower = pw.toLowerCase();
        for (int i = 0; i <= lower.length() - 4; i++) {
            boolean ascending = true;
            boolean descending = true;
            for (int j = i + 1; j < i + 4; j++) {
                if (lower.charAt(j) != lower.charAt(j - 1) + 1) {
                    ascending = false;
                }
                if (lower.charAt(j) != lower.charAt(j - 1) - 1) {
                    descending = false;
                }
            }
            if (ascending || descending) {
                return true;
            }
        }
        return false;
    }

    private boolean hasRepeatedChars(String pw) {
        for (int i = 0; i <= pw.length() - 4; i++) {
            char c = pw.charAt(i);
            if (pw.charAt(i + 1) == c && pw.charAt(i + 2) == c && pw.charAt(i + 3) == c) {
                return true;
            }
        }
        return false;
    }
}
