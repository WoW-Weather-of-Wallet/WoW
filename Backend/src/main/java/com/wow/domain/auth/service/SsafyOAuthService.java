package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.dto.ssafy.SsafyTokenResponse;
import com.wow.domain.auth.dto.ssafy.SsafyUserInfo;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class SsafyOAuthService {

    private static final String REFRESH_KEY_PREFIX = "refresh:";
    private static final String PENDING_KEY_PREFIX = "ssafy:pending:";
    private static final long PENDING_TTL_MINUTES = 30;

    @Value("${sso.ssafy.client-id}")
    private String clientId;

    @Value("${sso.ssafy.client-secret}")
    private String clientSecret;

    @Value("${sso.ssafy.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final StringRedisTemplate redisTemplate;
    private final SmsService smsService;

    // 1. 인가코드 받기 URL 생성
    public String getLoginUrl() {
        return "https://project.ssafy.com/oauth/sso-check"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code";
    }

    // 2. 인가코드로 로그인 처리
    public String login(String code) {

        SsafyTokenResponse tokenResponse = getAccessToken(code);

        SsafyUserInfo userInfo = getUserInfo(tokenResponse.getAccessToken());

        log.info("SSAFY 로그인 - userId: {}, name: {}", userInfo.getUserId(), userInfo.getName());

        Optional<User> existingUser = userRepository.findBySsafyOauthId(userInfo.getUserId());

        // 기존 회원이면 JWT 발급 후 딥링크 URL 반환
        if (existingUser.isPresent()) {
            log.info("기존 회원 로그인 - ssafyOauthId: {}", userInfo.getUserId());
            return buildLoginRedirectUrl(issueToken(existingUser.get()));
        }

        // 신규 회원 → 중복 검증 하기 전 Redis에 30분동안 ssafyOauthId 임시 저장
        log.info("신규 회원 - Redis 저장 키: {}", PENDING_KEY_PREFIX + userInfo.getUserId());
        redisTemplate.opsForValue().set(
                PENDING_KEY_PREFIX + userInfo.getUserId(),
                userInfo.getName(),
                Duration.ofMinutes(PENDING_TTL_MINUTES)
        );

        // 신규 회원 정보 입력 딥링크 반환 (성별, 생년월일, 전화번호)
        return UriComponentsBuilder
                .fromUriString("wow://auth/ssafy/register")
                .queryParam("ssafyOauthId", userInfo.getUserId())
                .build()
                .encode()
                .toUriString();
    }

    private String buildLoginRedirectUrl(UserLoginResponse login) {
        UriComponentsBuilder redirectBuilder = UriComponentsBuilder
                .fromUriString("wow://auth/ssafy/callback")
                .queryParam("accessToken", login.getAccessToken())
                .queryParam("refreshToken", login.getRefreshToken())
                .queryParam("expiresIn", login.getExpiresIn());

        if (login.getUser() != null) {
            if (login.getUser().getUserId() != null) {
                redirectBuilder.queryParam("userId", login.getUser().getUserId());
            }
            if (login.getUser().getName() != null) {
                redirectBuilder.queryParam("name", login.getUser().getName());
            }
            if (login.getUser().getLoginType() != null) {
                redirectBuilder.queryParam("loginType", login.getUser().getLoginType());
            }
        }

        return redirectBuilder.build().encode().toUriString();
    }

    // 3. 신규 SSAFY 회원 중복 확인 (SMS 인증 전)
    public void checkDuplicate(SsafyCheckRequest request) {

        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        String name = redisTemplate.opsForValue().get(PENDING_KEY_PREFIX + request.getSsafyOauthId());

        if (name == null) {
            throw new IllegalArgumentException("SSAFY 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        if (userRepository.existsByNameAndGenderAndBirthDate(name, request.getGender(), request.getBirthDate())) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("이미 가입된 전화번호입니다.");
        }

    }

    // 4. 신규 SSAFY 회원 SMS 인증 완료 후 회원가입 + JWT 발급
    @Transactional
    public UserLoginResponse register(SsafyRegisterRequest request) {

        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        String redisKey = PENDING_KEY_PREFIX + request.getSsafyOauthId();
        String name = redisTemplate.opsForValue().get(redisKey);
        log.info("Redis 조회 키: {}, 결과: {}", redisKey, name);

        if (name == null) {
            throw new IllegalArgumentException("SSAFY 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        if (userRepository.existsByNameAndGenderAndBirthDate(name, request.getGender(), request.getBirthDate())) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("이미 가입된 전화번호입니다.");
        }

        smsService.checkVerified(request.getPhoneNumber());

        User newUser = User.builder()
                .ssafyOauthId(request.getSsafyOauthId())
                .name(name)
                .gender(request.getGender())
                .alarmEnabled(request.isAlarmEnabled())
                .termsAgreed(request.isTermsAgreed())
                .birthDate(request.getBirthDate())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.User)
                .build();

        userRepository.save(newUser);

        redisTemplate.delete(PENDING_KEY_PREFIX + request.getSsafyOauthId());
        smsService.deleteVerified(request.getPhoneNumber());

        return issueToken(newUser);
    }

    // SSAFY 토큰 요청
    private SsafyTokenResponse getAccessToken(String code) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<SsafyTokenResponse> response = restTemplate.postForEntity(
                "https://project.ssafy.com/ssafy/oauth2/token",
                request,
                SsafyTokenResponse.class
        );

        return response.getBody();

    }

    // SSAFY 사용자 정보 조회
    private SsafyUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<SsafyUserInfo> response = restTemplate.exchange(
                "https://project.ssafy.com/ssafy/resources/userInfo",
                HttpMethod.GET,
                request,
                SsafyUserInfo.class
        );

        return response.getBody();
    }

    // JWT 발급 공통 로직
    private UserLoginResponse issueToken(User user) {

        String userId = user.getSsafyOauthId();
        String accessToken = jwtTokenProvider.createAccessToken(
                userId,
                List.of("ROLE_" + user.getRole().name())
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
                UserSummaryResponse.from(user)
        );

    }

}
