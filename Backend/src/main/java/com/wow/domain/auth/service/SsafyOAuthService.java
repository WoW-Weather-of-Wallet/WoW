package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.dto.ssafy.SsafyTokenResponse;
import com.wow.domain.auth.dto.ssafy.SsafyUserInfo;
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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SsafyOAuthService {

    private static final long PENDING_TTL_MINUTES = 30;
    private static final long AUTH_CODE_TTL_SECONDS = 30;
    private static final long STATE_TTL_MINUTES = 5;

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
    private final TermService termService;

    public String getLoginUrl() {
        String state = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                RedisKeys.SSAFY_STATE_PREFIX + state,
                "true",
                Duration.ofMinutes(STATE_TTL_MINUTES)
        );

        return UriComponentsBuilder.fromUriString("https://project.ssafy.com/oauth/sso-check")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
    }

    public String login(String code, String state) {
        validateState(state);

        SsafyTokenResponse tokenResponse = getAccessToken(code);
        SsafyUserInfo userInfo = getUserInfo(tokenResponse.getAccessToken());
        Optional<User> existingUser = userRepository.findBySsafyOauthId(userInfo.getUserId());

        if (existingUser.isPresent()) {
            String authCode = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(
                    RedisKeys.SSAFY_AUTH_CODE_PREFIX + authCode,
                    userInfo.getUserId(),
                    Duration.ofSeconds(AUTH_CODE_TTL_SECONDS)
            );
            return UriComponentsBuilder.fromUriString("wow://auth/ssafy/callback")
                    .queryParam("code", authCode)
                    .build()
                    .encode()
                    .toUriString();
        }

        redisTemplate.opsForValue().set(
                RedisKeys.SSAFY_PENDING_PREFIX + userInfo.getUserId(),
                userInfo.getName(),
                Duration.ofMinutes(PENDING_TTL_MINUTES)
        );

        return UriComponentsBuilder.fromUriString("wow://auth/ssafy/register")
                .queryParam("ssafyOauthId", userInfo.getUserId())
                .build()
                .encode()
                .toUriString();
    }

    public void checkDuplicate(SsafyCheckRequest request) {
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        String name = redisTemplate.opsForValue().get(RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId());
        if (name == null) {
            throw new IllegalArgumentException("SSAFY 인증 정보가 만료되었습니다. 다시 인증을 진행해주세요.");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }
        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }
    }

    @Transactional
    public UserLoginResponse register(SsafyRegisterRequest request) {
        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

        String redisKey = RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId();
        String name = redisTemplate.opsForValue().get(redisKey);
        if (name == null) {
            throw new IllegalArgumentException("SSAFY 인증 정보가 만료되었습니다. 다시 인증을 진행해주세요.");
        }

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }
        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new IllegalArgumentException("이미 가입된 회원입니다.");
        }

        Term currentRequiredTerm = termService.getCurrentRequiredTerm();

        smsService.checkVerified(phoneNumber);
        try {
            User newUser = User.builder()
                    .userId(null)
                    .pw(null)
                    .ssafyOauthId(request.getSsafyOauthId())
                    .name(name)
                    .gender(request.getGender())
                    .alarmEnabled(request.isAlarmEnabled())
                    .birthDate(request.getBirthDate())
                    .phoneNumber(phoneNumber)
                    .role(Role.USER)
                    .build();

            userRepository.save(newUser);

            userTermRepository.save(UserTerm.builder()
                    .user(newUser)
                    .term(currentRequiredTerm)
                    .agreed(request.isTermsAgreed())
                    .agreedAt(LocalDateTime.now())
                    .build());

            redisTemplate.delete(RedisKeys.SSAFY_PENDING_PREFIX + request.getSsafyOauthId());
            return issueToken(newUser);
        } finally {
            smsService.deleteVerified(phoneNumber);
        }
    }

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

        SsafyTokenResponse body = response.getBody();
        if (body == null || body.getAccessToken() == null || body.getAccessToken().isBlank()) {
            throw new IllegalArgumentException("SSAFY 토큰 응답이 올바르지 않습니다.");
        }
        return body;
    }

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

        SsafyUserInfo body = response.getBody();
        if (body == null || body.getUserId() == null || body.getUserId().isBlank()) {
            throw new IllegalArgumentException("SSAFY 사용자 정보 응답이 올바르지 않습니다.");
        }
        return body;
    }

    public UserLoginResponse exchangeToken(String code) {
        String ssafyOauthId = redisTemplate.opsForValue().get(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);
        if (ssafyOauthId == null) {
            throw new IllegalArgumentException("유효하지 않은 인증 코드입니다.");
        }

        redisTemplate.delete(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);

        User user = userRepository.findBySsafyOauthId(ssafyOauthId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return issueToken(user);
    }

    private void validateState(String state) {
        String stateKey = RedisKeys.SSAFY_STATE_PREFIX + state;
        String savedState = redisTemplate.opsForValue().get(stateKey);
        if (savedState == null) {
            throw new IllegalArgumentException("유효하지 않은 SSAFY 인증 요청입니다.");
        }
        redisTemplate.delete(stateKey);
    }

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
