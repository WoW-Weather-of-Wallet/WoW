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
import com.wow.domain.term.service.TermService;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.util.PhoneNumberUtils;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
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
    private final TermService termService;

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
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }
        if (userRepository.existsDuplicate(normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 등록된 회원입니다.");
        }

        validatePassword(request.getPw(), request.getUserId());
        Term currentRequiredTerm = termService.getCurrentRequiredTerm();

        smsService.checkVerified(phoneNumber);
        try {
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
                new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPw())
        );

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

        User user = userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                        normalizedName, request.getGender(), request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));

        if (user.getUserId() == null) {
            throw new IllegalArgumentException("SSAFY 계정으로 가입된 회원입니다.");
        }

        smsService.checkVerified(phoneNumber);
        try {
            return new FindIdResponse(user.getUserId());
        } finally {
            smsService.deleteVerified(phoneNumber);
        }
    }

    @Transactional
    public void findPassword(FindPwRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        String normalizedName = request.getName().trim();

        User user = userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                        request.getUserId(), normalizedName, request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보를 찾을 수 없습니다."));

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
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (user.getPw() == null) {
            throw new IllegalArgumentException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        if (!bCryptPasswordEncoder.matches(request.getCurrentPw(), user.getPw())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        validatePassword(request.getNewPw(), userId);
        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));
    }

    private void validatePassword(String pw, String userId) {
        if (pw == null || pw.length() < 8 || pw.length() > 20) {
            throw new IllegalArgumentException("비밀번호는 8자 이상 20자 이하여야 합니다.");
        }
        if (!pw.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("비밀번호에는 대문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("비밀번호에는 소문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("비밀번호에는 숫자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new IllegalArgumentException("비밀번호에는 특수문자가 최소 1자 이상 포함되어야 합니다.");
        }
        if (userId != null && userId.equals(pw)) {
            throw new IllegalArgumentException("비밀번호는 아이디와 동일하게 설정할 수 없습니다.");
        }
        if (hasConsecutiveSequence(pw)) {
            throw new IllegalArgumentException("비밀번호에 연속된 문자 또는 숫자 4자 이상을 사용할 수 없습니다.");
        }
        if (hasRepeatedChars(pw)) {
            throw new IllegalArgumentException("비밀번호에 같은 문자 또는 숫자 4자 이상을 반복할 수 없습니다.");
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
