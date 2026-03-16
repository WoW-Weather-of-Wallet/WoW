package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.*;
import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.security.CustomUserDetailsService;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_KEY_PREFIX = "refresh:";

    private final UserRepository userRepository;
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

        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 회원입니다.");
        }

        if (userRepository.existsByNameAndGenderAndBirthDate(request.getName(), request.getGender(), request.getBirthDate())) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("이미 가입된 전화번호입니다.");
        }

        smsService.checkVerified(request.getPhoneNumber());

        User user = User.builder()
                .userId(request.getUserId())
                .pw(bCryptPasswordEncoder.encode(request.getPw()))
                .name(request.getName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .birthDate(request.getBirthDate())
                .alarmEnabled(request.isAlarmEnabled())
                .termsAgreed(request.isTermsAgreed())
                .role(Role.User)
                .build();

        UserCreateResponse response = UserCreateResponse.from(userRepository.save(user));

        smsService.deleteVerified(request.getPhoneNumber());

        return response;

    }

    @Transactional(readOnly = true)
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

        user.updatePw(bCryptPasswordEncoder.encode(request.getNewPw()));

    }

}
