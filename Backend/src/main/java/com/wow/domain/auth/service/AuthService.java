package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.ChangePasswordRequest;
import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
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
import com.wow.domain.term.repository.TermRepository;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserTermRepository userTermRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final SmsService smsService;
    private final StringRedisTemplate redisTemplate;
    private final CustomUserDetailsService customUserDetailsService;
    private final TermRepository termRepository;

    @Transactional(readOnly = true)
    public UserIdCheckResponse checkUserId(String userId) {
        boolean isAvailable = !userRepository.existsByUserId(userId);
        String message = isAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.";
        return new UserIdCheckResponse(isAvailable, message, userId);
    }

    @Transactional
    public UserCreateResponse signup(UserCreateRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();

        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        if (userRepository.existsDuplicate(normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        validatePassword(request.getPw(), request.getUserId());
        Term currentRequiredTerm = getCurrentRequiredTerm();

        /*
         * 수정 이유:
         * - 기존에는 SMS 인증 완료 상태를 메서드 마지막에만 삭제해서,
         *   DB 저장 중 예외가 나면 같은 인증 상태를 다시 재사용할 수 있었습니다.
         * - 인증 확인 뒤에는 성공/실패와 관계없이 finally 에서 상태를 정리해
         *   SMS 인증을 일회성으로 소비하도록 변경했습니다.
         *
         * 수정 전 코드:
         * - smsService.checkVerified(phoneNumber);
         * - ... DB/JPA 작업 ...
         * - smsService.deleteVerified(phoneNumber);
         */
        smsService.checkVerified(phoneNumber);
        try {
            User user = User.builder()
                    .userId(request.getUserId())
                    /*
                     * 수정 이유:
                     * - 일반 회원은 userId만 가지고, ssafyOauthId는 null 이라는 정책을
                     *   생성 시점 코드에서 바로 보이게 하기 위해 명시했습니다.
                     *
                     * 수정 전 코드:
                     * - builder 기본값에 의존해 ssafyOauthId가 암묵적으로 null 이었습니다.
                     */
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

            userTermRepository.save(UserTerm.builder()
                    .user(user)
                    .term(currentRequiredTerm)
                    .agreed(request.isTermsAgreed())
                    .agreedAt(LocalDateTime.now())
                    .build());

            return UserCreateResponse.from(user);
        } finally {
            smsService.deleteVerified(phoneNumber);
        }
    }

    @Transactional
    public UserLoginResponse login(UserLoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUserId(),
                        request.getPw()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        String userId = userDetails.getUsername();
        String accessToken = jwtTokenProvider.createAccessToken(
                userId,
                userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList()
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
                UserSummaryResponse.from(userDetails.getUser())
        );
    }

    public TokenRefreshResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 refresh token입니다.");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String savedToken = redisTemplate.opsForValue().get(RedisKeys.REFRESH_TOKEN_PREFIX + userId);

        if (!refreshToken.equals(savedToken)) {
            throw new IllegalArgumentException("refresh token이 일치하지 않습니다.");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        /*
         * 수정 이유:
         * - 기존에는 access token만 재발급하고 refresh token은 그대로 유지해서,
         *   탈취된 refresh token이 계속 재사용될 수 있었습니다.
         * - refresh token도 새로 발급하고 Redis 저장값을 교체하는 rotation 방식으로 보완했습니다.
         *
         * 수정 전 코드:
         * - String newAccessToken = jwtTokenProvider.createAccessToken(userId, roles);
         * - return new TokenRefreshResponse(newAccessToken, jwtTokenProvider.getAccessTokenValidityInSeconds());
         */
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

        /*
         * 수정 이유:
         * - SSAFY 계정 여부를 안내하는 현재 정책을 유지하되,
         *   본인 확인 강도를 높이기 위해 gender까지 조회 조건에 포함했습니다.
         *
         * 수정 전 코드:
         * - userRepository.findByNameAndBirthDateAndPhoneNumber(request.getName(), request.getBirthDate(), phoneNumber)
         */
        User user = userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                        normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        /*
         * 수정 이유:
         * - 최종 정책은 SSAFY 계정이면 계정 유형을 안내하는 것이므로,
         *   이전에 남아 있던 상충 주석을 제거하고 현재 정책만 남겼습니다.
         *
         * 수정 전 코드:
         * - 서로 반대 의미의 정책 주석이 함께 남아 있었습니다.
         */
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("SSAFY 계정으로 가입된 회원입니다.");
        }

        smsService.checkVerified(phoneNumber);
        smsService.deleteVerified(phoneNumber);

        return new FindIdResponse(user.getUserId());
    }

    @Transactional
    public void findPassword(FindPwRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();

        User user = userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                        request.getUserId(), normalizedName, request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        smsService.checkVerified(phoneNumber);
        try {
            validatePassword(request.getNewPw(), request.getUserId());
            user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));
        } finally {
            smsService.deleteVerified(phoneNumber);
        }
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (user.getPw() == null) {
            throw new IllegalArgumentException("소셜 로그인 계정은 비밀번호 변경이 불가능합니다.");
        }

        if (!bCryptPasswordEncoder.matches(request.getCurrentPw(), user.getPw())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        validatePassword(request.getNewPw(), userId);
        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));
    }

    private void validatePassword(String pw, String userId) {
        if (pw == null || pw.length() < 8 || pw.length() > 20) {
            throw new IllegalArgumentException("비밀번호는 8자 이상 20자 이하로 입력해야 합니다.");
        }
        if (!pw.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("비밀번호에는 영문 대문자를 1자 이상 포함해야 합니다.");
        }
        if (!pw.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("비밀번호에는 영문 소문자를 1자 이상 포함해야 합니다.");
        }
        if (!pw.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("비밀번호에는 숫자를 1자 이상 포함해야 합니다.");
        }
        if (!pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new IllegalArgumentException("비밀번호에는 특수문자를 1자 이상 포함해야 합니다.");
        }
        if (userId != null && userId.equals(pw)) {
            throw new IllegalArgumentException("비밀번호는 아이디와 동일할 수 없습니다.");
        }
        if (hasConsecutiveSequence(pw)) {
            throw new IllegalArgumentException("비밀번호에 연속된 문자 또는 숫자 4자 이상은 사용할 수 없습니다.");
        }
        if (hasRepeatedChars(pw)) {
            throw new IllegalArgumentException("비밀번호에 동일한 문자 또는 숫자 4자 이상 반복은 사용할 수 없습니다.");
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

    private Term getCurrentRequiredTerm() {
        /*
         * 수정 이유:
         * - UserTerm.term 은 nullable = false 이므로 가입 시 현재 유효한 필수 약관을 반드시 함께 저장해야 합니다.
         * - 저장 직전에 약관을 조회해 일반 가입과 SSAFY 가입 모두 동일한 기준으로 term 을 연결합니다.
         *
         * 수정 전 코드:
         * - UserTerm.builder()
         * -         .user(user)
         * -         .agreed(...)
         * -         .agreedAt(...)
         * -         .build();
         */
        return termRepository.findFirstByRequiredTrueAndEffectiveAtLessThanEqualOrderByEffectiveAtDescIdDesc(LocalDate.now())
                .orElseThrow(() -> new IllegalStateException("현재 유효한 필수 약관이 존재하지 않습니다."));
    }
}
