package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.dto.ssafy.SsafyTokenResponse;
import com.wow.domain.auth.dto.ssafy.SsafyUserInfo;
import com.wow.global.constant.RedisKeys;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class SsafyOAuthService {

    private static final long PENDING_TTL_MINUTES = 30;
    private static final long AUTH_CODE_TTL_SECONDS = 30;

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
    private final UserTermRepository userTermRepository;

    // 1. 인가코드 받기 URL 생성
    public String getLoginUrl() {
        /*
         * 수정 이유:
         * - redirect_uri를 문자열로 직접 붙이면 인코딩이 보장되지 않습니다.
         * - OAuth 쿼리 파라미터는 UriComponentsBuilder로 조합해 안전하게 인코딩하도록 변경했습니다.
         *
         * 수정 전 코드:
         * - return "https://project.ssafy.com/oauth/sso-check"
         * -         + "?client_id=" + clientId
         * -         + "&redirect_uri=" + redirectUri
         * -         + "&response_type=code";
         */
        return UriComponentsBuilder.fromUriString("https://project.ssafy.com/oauth/sso-check")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .build()
                .encode()
                .toUriString();
    }

    // 2. 인가코드로 로그인 처리
    public String login(String code) {

        SsafyTokenResponse tokenResponse = getAccessToken(code);

        SsafyUserInfo userInfo = getUserInfo(tokenResponse.getAccessToken());

        Optional<User> existingUser = userRepository.findBySsafyOauthId(userInfo.getUserId());

        // 기존 회원이면 일회성 code 발급 후 딥링크 URL 반환
        if (existingUser.isPresent()) {
            String authCode = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(
                    RedisKeys.SSAFY_AUTH_CODE_PREFIX + authCode,
                    userInfo.getUserId(),
                    Duration.ofSeconds(AUTH_CODE_TTL_SECONDS)
            );
            return UriComponentsBuilder
                    .fromUriString("wow://auth/ssafy/callback")
                    .queryParam("code", authCode)
                    .build()
                    .encode()
                    .toUriString();
        }

        // 신규 회원 → 중복 검증 하기 전 Redis에 30분동안 ssafyOauthId 임시 저장
        redisTemplate.opsForValue().set(
                RedisKeys.SSAFY_PENDING_PREFIX + userInfo.getUserId(),
                userInfo.getName(),
                Duration.ofMinutes(PENDING_TTL_MINUTES)
        );

        // 신규 회원 정보 입력 딥링크 반환
        return UriComponentsBuilder
                .fromUriString("wow://auth/ssafy/register")
                .queryParam("ssafyOauthId", userInfo.getUserId())
                .build()
                .encode()
                .toUriString();
    }

    // 3. 신규 SSAFY 회원 중복 확인 (SMS 인증 전)
    public void checkDuplicate(SsafyCheckRequest request) {

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        String name = redisTemplate.opsForValue().get(RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId());

        if (name == null) {
            throw new IllegalArgumentException("SSAFY 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

    }

    // 4. 신규 SSAFY 회원 SMS 인증 완료 후 회원가입 + JWT 발급
    @Transactional
    public UserLoginResponse register(SsafyRegisterRequest request) {

        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        // redis에서 ssafyOauthId로 name 가져오기
        String redisKey = RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId();
        String name = redisTemplate.opsForValue().get(redisKey);

        if (name == null) {
            throw new IllegalArgumentException("SSAFY 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        // SMS 검증
        smsService.checkVerified(phoneNumber);

        User newUser = User.builder()
                .ssafyOauthId(request.getSsafyOauthId())
                .name(name)
                .gender(request.getGender())
                .alarmEnabled(request.isAlarmEnabled())
                .birthDate(request.getBirthDate())
                .phoneNumber(phoneNumber)
                .role(Role.User)
                .build();

        // USER 저장
        userRepository.save(newUser);

        // 회원 동의 이력 저장
        userTermRepository.save(UserTerm.builder()
                .user(newUser)
                .agreed(request.isTermsAgreed())
                .agreedAt(LocalDateTime.now())
                .build());

        // redis에서 ssafyOauthId 삭제
        redisTemplate.delete(RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId());

        // redis에서 sms 인증 완료 기록 삭제
        smsService.deleteVerified(phoneNumber);

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

        /*
         * 수정 이유:
         * - 외부 API 응답 body가 비어 있으면 이후 getAccessToken() 호출 시 NPE가 발생할 수 있습니다.
         * - 응답 구조를 먼저 검증하고, 비정상 응답이면 명확한 예외를 던지도록 변경했습니다.
         *
         * 수정 전 코드:
         * - return response.getBody();
         */
        SsafyTokenResponse body = response.getBody();
        if (body == null || body.getAccessToken() == null || body.getAccessToken().isBlank()) {
            throw new IllegalArgumentException("SSAFY 토큰 응답이 올바르지 않습니다.");
        }

        return body;

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

        /*
         * 수정 이유:
         * - 외부 API 응답 body가 비어 있으면 이후 userInfo.getUserId() 사용 지점에서 NPE가 발생할 수 있습니다.
         * - 최소한의 필수 필드를 확인한 뒤에만 다음 로직으로 진행하도록 변경했습니다.
         *
         * 수정 전 코드:
         * - return response.getBody();
         */
        SsafyUserInfo body = response.getBody();
        if (body == null || body.getUserId() == null || body.getUserId().isBlank()) {
            throw new IllegalArgumentException("SSAFY 사용자 정보 응답이 올바르지 않습니다.");
        }

        return body;

    }

    // 일회성 code로 JWT 교환
    public UserLoginResponse exchangeToken(String code) {

        String ssafyOauthId = redisTemplate.opsForValue().get(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);

        if (ssafyOauthId == null) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 코드입니다.");
        }

        redisTemplate.delete(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);

        User user = userRepository.findBySsafyOauthId(ssafyOauthId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return issueToken(user);

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
                RedisKeys.REFRESH_TOKEN_PREFIX + userId,
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
