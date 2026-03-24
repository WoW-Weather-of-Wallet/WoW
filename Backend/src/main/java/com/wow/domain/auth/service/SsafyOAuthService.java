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
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.InvalidTokenException;
import com.wow.global.exception.NotFoundException;
import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SsafyOAuthService {

    private static final Logger log = LoggerFactory.getLogger(SsafyOAuthService.class);
    private static final Pattern UNICODE_ESCAPE_PATTERN = Pattern.compile("\\\\u([0-9a-fA-F]{4})");

    private static final long PENDING_TTL_MINUTES = 30;
    private static final long AUTH_CODE_TTL_SECONDS = 30;
    private static final long STATE_TTL_MINUTES = 5;

    @Value("${sso.ssafy.client-id}")
    private String clientId;

    @Value("${sso.ssafy.client-secret}")
    private String clientSecret;

    @Value("${sso.ssafy.redirect-uri}")
    private String redirectUri;

    @Value("${app.ssafy-app-base-uri:wow://auth/ssafy}")
    private String ssafyAppBaseUri;

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
        String decodedName = decodeUnicodeEscapes(userInfo.getName());
        Optional<User> existingUser = userRepository.findBySsafyOauthId(userInfo.getUserId());

        if (existingUser.isPresent()) {
            String authCode = UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(
                    RedisKeys.SSAFY_AUTH_CODE_PREFIX + authCode,
                    userInfo.getUserId(),
                    Duration.ofSeconds(AUTH_CODE_TTL_SECONDS)
            );
            return UriComponentsBuilder.fromUriString(buildAppRedirectUri())
                    .queryParam("code", authCode)
                    .build()
                    .encode()
                    .toUriString();
        }

        // [fix] 수정 전: ssafyOauthId를 딥링크 URL에 직접 노출 (queryParam("ssafyOauthId", userInfo.getUserId()))
        // 이유: 클라이언트가 ssafyOauthId를 조작하여 타인의 SSAFY 계정으로 가입 가능 → opaque pending token으로 대체
        String pendingToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                RedisKeys.SSAFY_PENDING_PREFIX + pendingToken,
                userInfo.getUserId() + "|" + decodedName,
                Duration.ofMinutes(PENDING_TTL_MINUTES)
        );

        return UriComponentsBuilder.fromUriString(buildAppRedirectUri())
                .queryParam("pendingToken", pendingToken)
                .queryParam("name", decodedName)
                .build()
                .encode()
                .toUriString();
    }

    public void checkDuplicate(SsafyCheckRequest request) {
        // [fix] 수정 전: request.getSsafyOauthId()로 직접 접근 | 이유: opaque pending token에서 ssafyOauthId를 서버사이드에서 resolve
        String[] pendingData = resolvePendingToken(request.getPendingToken());
        String ssafyOauthId = pendingData[0];
        String name = pendingData[1];
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (userRepository.existsByUserIdOrSsafyOauthId(ssafyOauthId, ssafyOauthId)) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 중복은 409 CONFLICT가 적절
            throw new DuplicateException("이미 가입된 SSAFY 계정입니다.");
        }
        // [fix] 수정 전: existsByPhoneNumber → existsDuplicate 순서 | 이유: 이름+성별+생년월일+전화번호 4개 조건이 모두 일치하면 동일인으로 판단하여 먼저 차단,
        //   이후 전화번호만 다른 타인의 번호 중복은 별도 메시지로 구분
        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new DuplicateException("이미 가입된 회원입니다.");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateException("이미 사용 중인 전화번호입니다.");
        }
    }

    @Transactional
    public UserLoginResponse register(SsafyRegisterRequest request) {
        // [fix] 수정 전: request.getSsafyOauthId()로 직접 접근 | 이유: opaque pending token에서 서버사이드 resolve
        String[] pendingData = resolvePendingToken(request.getPendingToken());
        String ssafyOauthId = pendingData[0];
        String name = pendingData[1];

        if (userRepository.existsByUserIdOrSsafyOauthId(ssafyOauthId, ssafyOauthId)) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 중복은 409 CONFLICT가 적절
            throw new DuplicateException("이미 가입된 SSAFY 계정입니다.");
        }

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());
        // [fix] 수정 전: existsByPhoneNumber → existsDuplicate 순서 | 이유: 이름+성별+생년월일+전화번호 4개 조건이 모두 일치하면 동일인으로 판단하여 먼저 차단,
        //   이후 전화번호만 다른 타인의 번호 중복은 별도 메시지로 구분
        if (userRepository.existsDuplicate(name, request.getGender(), request.getBirthDate(), phoneNumber)) {
            throw new DuplicateException("이미 가입된 회원입니다.");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateException("이미 사용 중인 전화번호입니다.");
        }

        List<Term> currentRequiredTerms = termService.getCurrentRequiredTerms();

        // [fix] 수정 전: smsService.checkVerified() + try/finally { smsService.deleteVerified() } | 이유: 원자적 checkAndConsume으로 레이스 컨디션 방지
        smsService.checkAndConsumeVerified(phoneNumber);

        User newUser = User.builder()
                .userId(null)
                .pw(null)
                .ssafyOauthId(ssafyOauthId)
                .name(name)
                .gender(request.getGender())
                .alarmEnabled(request.isAlarmEnabled())
                .birthDate(request.getBirthDate())
                .phoneNumber(phoneNumber)
                .role(Role.USER)
                .build();

        userRepository.save(newUser);

        /*
         * SSAFY signup uses the same boolean contract as the normal signup API.
         * We map that single flag to the full set of active required terms so the
         * persisted agreement history matches what the UI actually asked the user.
         */
        saveRequiredTermAgreements(newUser, currentRequiredTerms);

        redisTemplate.delete(RedisKeys.SSAFY_PENDING_PREFIX + request.getPendingToken());
        return issueToken(newUser);
    }

    // [added] 이유: opaque pending token에서 ssafyOauthId와 name을 서버사이드에서 안전하게 추출
    private String[] resolvePendingToken(String pendingToken) {
        String value = redisTemplate.opsForValue().get(RedisKeys.SSAFY_PENDING_PREFIX + pendingToken);
        if (value == null) {
            throw new BadRequestException("SSAFY 인증 정보가 만료되었습니다. 다시 인증을 진행해주세요.");
        }
        String[] parts = value.split("\\|", 2);
        if (parts.length != 2) {
            throw new BadRequestException("SSAFY 인증 정보가 올바르지 않습니다.");
        }
        return parts;
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

        // [added] 이유: RestClientException이 catch되지 않아 500 에러로 전파 → 적절한 예외 처리 추가
        try {
            ResponseEntity<SsafyTokenResponse> response = restTemplate.postForEntity(
                    "https://project.ssafy.com/ssafy/oauth2/token",
                    request,
                    SsafyTokenResponse.class
            );

            SsafyTokenResponse body = response.getBody();
            if (body == null || body.getAccessToken() == null || body.getAccessToken().isBlank()) {
                throw new BadRequestException("SSAFY 토큰 응답이 올바르지 않습니다.");
            }
            return body;
        } catch (RestClientException e) {
            log.error("SSAFY 토큰 교환 실패: {}", e.getMessage(), e);
            throw new BadRequestException("SSAFY 인증 서버와 통신에 실패했습니다.");
        }
    }

    private SsafyUserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<?> request = new HttpEntity<>(headers);

        // [added] 이유: RestClientException이 catch되지 않아 500 에러로 전파 → 적절한 예외 처리 추가
        try {
            ResponseEntity<SsafyUserInfo> response = restTemplate.exchange(
                    "https://project.ssafy.com/ssafy/resources/userInfo",
                    HttpMethod.GET,
                    request,
                    SsafyUserInfo.class
            );

            SsafyUserInfo body = response.getBody();
            if (body == null || body.getUserId() == null || body.getUserId().isBlank()) {
                throw new BadRequestException("SSAFY 사용자 정보 응답이 올바르지 않습니다.");
            }
            return body;
        } catch (RestClientException e) {
            log.error("SSAFY 사용자 정보 조회 실패: {}", e.getMessage(), e);
            throw new BadRequestException("SSAFY 인증 서버와 통신에 실패했습니다.");
        }
    }

    public UserLoginResponse exchangeToken(String code) {
        String ssafyOauthId = redisTemplate.opsForValue().get(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);
        if (ssafyOauthId == null) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 인증 코드 관련 오류는 401 UNAUTHORIZED가 적절
            throw new InvalidTokenException("유효하지 않은 인증 코드입니다.");
        }

        redisTemplate.delete(RedisKeys.SSAFY_AUTH_CODE_PREFIX + code);

        User user = userRepository.findBySsafyOauthId(ssafyOauthId)
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        return issueToken(user);
    }

    private void validateState(String state) {
        String stateKey = RedisKeys.SSAFY_STATE_PREFIX + state;
        String savedState = redisTemplate.opsForValue().get(stateKey);
        if (savedState == null) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("유효하지 않은 SSAFY 인증 요청입니다.");
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

    private String buildAppRedirectUri() {
        return ssafyAppBaseUri.endsWith("/")
                ? ssafyAppBaseUri.substring(0, ssafyAppBaseUri.length() - 1)
                : ssafyAppBaseUri;
    }

    private String decodeUnicodeEscapes(String value) {
        if (value == null || value.isBlank() || !value.contains("\\u")) {
            return value;
        }

        Matcher matcher = UNICODE_ESCAPE_PATTERN.matcher(value);
        StringBuilder decoded = new StringBuilder();

        while (matcher.find()) {
            char unicodeChar = (char) Integer.parseInt(matcher.group(1), 16);
            matcher.appendReplacement(decoded, Matcher.quoteReplacement(String.valueOf(unicodeChar)));
        }

        matcher.appendTail(decoded);
        return decoded.toString();
    }
}
