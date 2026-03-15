package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.UserSummaryResponse;
import com.wow.domain.auth.dto.ssafy.SsafyTokenResponse;
import com.wow.domain.auth.dto.ssafy.SsafyUserInfo;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class SsafyOAuthService {

    @Value("${sso.ssafy.client-id}")
    private String clientId;

    @Value("${sso.ssafy.client-secret}")
    private String clientSecret;

    @Value("${sso.ssafy.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. 인가코드 받기 URL 생성
    public String getLoginUrl() {
        return "https://project.ssafy.com/oauth/sso-check"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code";
    }

    // 2. 인가코드로 로그인 전체 처리
    public UserLoginResponse login(String code) {
        // 2-1. 인가코드 → SSAFY 액세스 토큰
        SsafyTokenResponse tokenResponse = getAccessToken(code);

        // 2-2. 액세스 토큰 → SSAFY 사용자 정보
        SsafyUserInfo userInfo = getUserInfo(tokenResponse.getAccessToken());

        // 2-3. DB 조회 → 있으면 로그인, 없으면 회원가입
        User user = userRepository.findBySsafyOauthId(userInfo.getUserId())
                .orElseGet(() -> registerUser(userInfo));

        // 2-4. 우리 서비스 JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(
                user.getSsafyOauthId(),
                List.of("ROLE_" + user.getRole().name())
        );

        return UserLoginResponse.of(
                accessToken,
                jwtTokenProvider.getAccessTokenValidityInSeconds(),
                UserSummaryResponse.from(user)
        );
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

    // 신규 회원가입
    private User registerUser(SsafyUserInfo userInfo) {
        User newUser = User.builder()
                .ssafyOauthId(userInfo.getUserId())
                .name(userInfo.getName())
                .role(Role.User)
                .build();
        return userRepository.save(newUser);
    }
}
