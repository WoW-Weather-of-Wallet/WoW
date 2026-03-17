package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.*;
import com.wow.global.util.PhoneNumberUtils;
import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.security.CustomUserDetailsService;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
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

    private static final String REFRESH_KEY_PREFIX = "refresh:";

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
            throw new IllegalArgumentException("이미 존재하는 회원입니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        if (userRepository.existsDuplicate(request.getName(), request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        validatePassword(request.getPw(), request.getUserId());

        // SMS 검증 확인
        smsService.checkVerified(phoneNumber);

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

        // USER 저장
        userRepository.save(user);

        // 회원 동의 이력 저장
        userTermRepository.save(UserTerm.builder()
                .user(user)
                .agreed(request.isTermsAgreed())
                .agreedAt(LocalDateTime.now())
                .build());

        UserCreateResponse response = UserCreateResponse.from(user);

        // Redis에 인증 이력 삭제
        smsService.deleteVerified(phoneNumber);

        return response;

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
                REFRESH_KEY_PREFIX + userId,
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
        String savedToken = redisTemplate.opsForValue().get(REFRESH_KEY_PREFIX + userId);

        if (!refreshToken.equals(savedToken)) {
            throw new IllegalArgumentException("refresh token이 일치하지 않습니다.");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(userId);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String newAccessToken = jwtTokenProvider.createAccessToken(userId, roles);

        return new TokenRefreshResponse(newAccessToken, jwtTokenProvider.getAccessTokenValidityInSeconds());
    }

    public void logout(String userId) {

        redisTemplate.delete(REFRESH_KEY_PREFIX + userId);

    }

    @Transactional(readOnly = true)
    public FindIdResponse findId(FindIdRequest request) {

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        /*
         * 수정 이유:
         * - SSAFY 계정 여부를 안내하는 정책을 유지하는 대신, 조회 조건을 gender까지 포함해 본인 확인 강도를 높였습니다.
         *
         * 수정 전 코드:
         * - userRepository.findByNameAndBirthDateAndPhoneNumber(request.getName(), request.getBirthDate(), phoneNumber)
         */
        User user = userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                request.getName(), request.getGender(), request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        /*
         * 수정 이유:
         * - 아이디 찾기 응답에서 "SSAFY 계정" 여부를 따로 알려주면 계정 유형 정보가 노출됩니다.
         * - 찾기 실패 상황은 같은 메시지로 반환해 불필요한 정보 노출을 줄이도록 변경했습니다.
         *
         * 수정 전 코드:
         * - if (user.getUserId() == null) {
         * -     throw new IllegalArgumentException("SSAFY 계정으로 가입된 회원입니다.");
         * - }
         */
        /*
         * 수정 이유:
         * - 정책 변경에 따라 SSAFY 계정 여부는 알려주되, 조회 조건을 gender까지 포함해 본인 확인 강도를 높였습니다.
         *
         * 수정 전 코드:
         * - if (user.getUserId() == null) {
         * -     throw new IllegalArgumentException("일치하는 회원 정보가 없습니다.");
         * - }
         */
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("SSAFY 계정으로 가입된 회원입니다.");
        }

        smsService.checkVerified(phoneNumber);
        smsService.deleteVerified(phoneNumber);

        return new FindIdResponse(user.getUserId());

    }

    @Transactional
    public void findPw(FindPwRequest request) {

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        User user = userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                request.getUserId(), request.getName(), request.getBirthDate(), phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 회원 정보가 없습니다."));

        smsService.checkVerified(phoneNumber);

        validatePassword(request.getNewPw(), request.getUserId());

        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));

        smsService.deleteVerified(phoneNumber);

    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {

        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (user.getPw() == null) {
            throw new IllegalArgumentException("일반 회원만 비밀번호를 변경할 수 있습니다.");
        }

        if (!bCryptPasswordEncoder.matches(request.getCurrentPw(), user.getPw())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        validatePassword(request.getNewPw(), userId);

        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));

    }

    private void validatePassword(String pw, String userId) {
        if (pw == null || pw.length() < 8 || pw.length() > 20) {
            throw new IllegalArgumentException("비밀번호는 8자 이상 20자 이하여야 합니다.");
        }
        if (!pw.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("비밀번호에 영문 대문자가 1개 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("비밀번호에 영문 소문자가 1개 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("비밀번호에 숫자가 1개 이상 포함되어야 합니다.");
        }
        if (!pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new IllegalArgumentException("비밀번호에 특수문자가 1개 이상 포함되어야 합니다.");
        }
        if (userId != null && userId.equals(pw)) {
            throw new IllegalArgumentException("비밀번호는 아이디와 동일할 수 없습니다.");
        }
        if (hasConsecutiveSequence(pw)) {
            throw new IllegalArgumentException("비밀번호에 연속된 문자/숫자를 4개 이상 사용할 수 없습니다.");
        }
        if (hasRepeatedChars(pw)) {
            throw new IllegalArgumentException("비밀번호에 동일한 문자/숫자를 4개 이상 연속 사용할 수 없습니다.");
        }
    }

    private boolean hasConsecutiveSequence(String pw) {
        String lower = pw.toLowerCase();
        for (int i = 0; i <= lower.length() - 4; i++) {
            boolean ascending = true;
            boolean descending = true;
            for (int j = i + 1; j < i + 4; j++) {
                if (lower.charAt(j) != lower.charAt(j - 1) + 1) ascending = false;
                if (lower.charAt(j) != lower.charAt(j - 1) - 1) descending = false;
            }
            if (ascending || descending) return true;
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
