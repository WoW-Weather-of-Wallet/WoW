package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.dto.ssafy.SsafyTokenResponse;
import com.wow.domain.auth.dto.ssafy.SsafyUserInfo;
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
import java.time.LocalDate;
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
    private final TermRepository termRepository;

    // 1. 인가 코드 요청 URL 생성
    public String getLoginUrl() {


        /*
         * 수정 이유:
         * - redirect_uri를 문자열로 직접 붙이면 인코딩이 보장되지 않습니다.
         * - OAuth 시작 요청과 콜백 요청을 묶기 위한 state 값을 함께 발급해야 합니다.
         *
         * 수정 전 코드:
         * - return "https://project.ssafy.com/oauth/sso-check"
         * -         + "?client_id=" + clientId
         * -         + "&redirect_uri=" + redirectUri
         * -         + "&response_type=code";
         */
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

    // 2. 인가 코드로 로그인 처리
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
            return UriComponentsBuilder
                    .fromUriString("wow://auth/ssafy/callback")
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

        return UriComponentsBuilder
                .fromUriString("wow://auth/ssafy/register")
                .queryParam("ssafyOauthId", userInfo.getUserId())
                .build()
                .encode()
                .toUriString();
    }

    // 3. 신규 SSAFY 회원 중복 확인
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

    // 4. 신규 SSAFY 회원가입 + JWT 발급
    @Transactional
    public UserLoginResponse register(SsafyRegisterRequest request) {
        if (userRepository.existsBySsafyOauthId(request.getSsafyOauthId())) {
            throw new IllegalArgumentException("이미 가입된 SSAFY 계정입니다.");
        }

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

        /*
         * 수정 이유:
         * - SSAFY 신규 가입도 마지막에만 인증 상태를 지우면 DB 예외 시 같은 인증을 재사용할 수 있습니다.
         * - 인증 확인 뒤에는 finally 에서 상태를 정리해 실패 케이스까지 일회성으로 소비되게 했습니다.
         *
         * 수정 전 코드:
         * - smsService.checkVerified(phoneNumber);
         * - ... DB/JPA 작업 ...
         * - smsService.deleteVerified(phoneNumber);
         */
        Term currentRequiredTerm = getCurrentRequiredTerm();

        smsService.checkVerified(phoneNumber);
        try {
            User newUser = User.builder()
                    /*
                     * 수정 이유:
                     * - SSAFY 회원은 ssafyOauthId만 가지고 일반 로그인용 userId/pw는 null이라는 정책을
                     *   생성 시점 코드에서 바로 보이게 하기 위해 명시했습니다.
                     *
                     * 수정 전 코드:
                     * - builder 기본값에 의존해 userId/pw가 암묵적으로 null 이었습니다.
                     */
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
         * - 외부 API 응답 body가 비어 있으면 이후 getAccessToken() 호출 지점에서 NPE가 발생할 수 있습니다.
         * - 응답 구조를 먼저 검증하고 비정상 응답이면 명확한 예외를 던지도록 변경했습니다.
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

    // 1회용 code로 JWT 교환
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

    private void validateState(String state) {
        /*
         * 수정 이유:
         * - OAuth 콜백이 로그인 시작 요청과 묶이지 않으면 로그인 CSRF나 계정 혼선 위험이 있습니다.
         * - 로그인 URL 발급 시 저장한 state를 콜백에서 검증하고 1회 사용 후 즉시 삭제합니다.
         *
         * 수정 전 코드:
         * - callback에서 code만 받아 별도의 시작점 검증 없이 로그인 처리를 진행했습니다.
         */
        String stateKey = RedisKeys.SSAFY_STATE_PREFIX + state;
        String savedState = redisTemplate.opsForValue().get(stateKey);

        if (savedState == null) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 SSAFY 로그인 요청입니다.");
        }

        redisTemplate.delete(stateKey);
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

    private Term getCurrentRequiredTerm() {
        /*
         * 수정 이유:
         * - UserTerm.term 은 nullable = false 이므로 SSAFY 가입 시에도 현재 유효한 필수 약관을 반드시 함께 저장해야 합니다.
         * - 일반 가입과 동일한 기준으로 필수 약관을 조회해 term_id 누락 저장을 방지합니다.
         *
         * 수정 전 코드:
         * - UserTerm.builder()
         * -         .user(newUser)
         * -         .agreed(...)
         * -         .agreedAt(...)
         * -         .build();
         */
        return termRepository.findFirstByRequiredTrueAndEffectiveAtLessThanEqualOrderByEffectiveAtDescIdDesc(LocalDate.now())
                .orElseThrow(() -> new IllegalStateException("현재 유효한 필수 약관이 존재하지 않습니다."));
    }
}
