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

    @Transactional(readOnly = true)
    public UserIdCheckResponse checkUserId(String userId) {

        boolean isAvailable = !userRepository.existsByUserId(userId);

        String message = isAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.";

        return new UserIdCheckResponse(isAvailable, message, userId);
    }

    @Transactional
    public UserCreateResponse signup(UserCreateRequest request) {

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        if (userRepository.existsDuplicate(request.getName(), request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        validatePassword(request.getPw(), request.getUserId());

        /*
         * 수정 이유:
         * - 기존에는 인증 완료 상태를 마지막에만 삭제해서, DB 저장 중 예외가 나면 같은 SMS 인증을 다시 재사용할 수 있었습니다.
         * - 인증 확인 이후에는 성공/실패와 관계없이 finally 에서 상태를 정리해 일회성으로 소비되도록 변경합니다.
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
                    .pw(bCryptPasswordEncoder.encode(request.getPw()))
                    .name(request.getName())
                    .gender(request.getGender())
                    .phoneNumber(phoneNumber)
                    .birthDate(request.getBirthDate())
                    .alarmEnabled(request.isAlarmEnabled())
                    .role(Role.User)
                    .build();

            userRepository.save(user);

            userTermRepository.save(UserTerm.builder()
                    .user(user)
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
         * - 기존에는 access token만 재발급해서 refresh token 탈취 시 같은 값을 계속 재사용할 수 있었습니다.
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

        /*
         * 수정 이유:
         * - SSAFY 계정 여부를 안내하는 현재 정책을 유지하되, 조회 조건에 gender까지 포함해
         *   name/gender/birthDate/phoneNumber 조합으로 본인 확인 강도를 높였습니다.
         *
         * 수정 전 코드:
         * - userRepository.findByNameAndBirthDateAndPhoneNumber(request.getName(), request.getBirthDate(), phoneNumber)
         */
        User user = userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                        request.getName(), request.getGender(), request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        /*
         * 수정 이유:
         * - 최종 정책은 SSAFY 계정이면 계정 유형을 안내하는 것이므로, 상충되는 이전 주석을 제거하고
         *   현재 의도를 한 블록으로만 남깁니다.
         *
         * 수정 전 코드:
         * - 상반된 정책 설명 주석 두 개가 함께 남아 있었습니다.
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

        User user = userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                        request.getUserId(), request.getName(), request.getBirthDate(), phoneNumber)
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
            throw new IllegalArgumentException("비밀번호에 연속된 문자 또는 숫자 4자를 사용할 수 없습니다.");
        }
        if (hasRepeatedChars(pw)) {
            throw new IllegalArgumentException("비밀번호에 동일한 문자 또는 숫자 4자를 반복할 수 없습니다.");
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
