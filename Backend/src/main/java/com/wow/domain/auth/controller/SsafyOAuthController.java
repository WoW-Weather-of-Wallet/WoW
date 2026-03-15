package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.service.SsafyOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Tag(name = "SSAFY OAuth", description = "SSAFY SSO OAuth API")
@RestController
@RequestMapping("/sso/providers/ssafy")
@RequiredArgsConstructor
public class SsafyOAuthController {

    private final SsafyOAuthService ssafyOAuthService;

    @Operation(summary = "SSAFY 로그인 페이지 요청", description = "SSAFY SSO 로그인 페이지로 사용자를 리다이렉트합니다.")
    @GetMapping("/login")
    public void login(HttpServletResponse response) throws IOException {
        response.sendRedirect(ssafyOAuthService.getLoginUrl());
    }

    @Operation(summary = "SSAFY 로그인 콜백", description = "SSAFY SSO 인증 완료 후 JWT를 발급하고 앱 딥링크로 다시 리다이렉트합니다.")
    @GetMapping("/callback")
    public void callback(@RequestParam String code, HttpServletResponse response) throws IOException {
        // SSAFY 인증이 끝나면 백엔드가 code를 받아 자체 로그인 처리를 먼저 완료합니다.
        // 이 시점에서 access/refresh token과 사용자 요약 정보가 만들어집니다.
        UserLoginResponse loginResponse = ssafyOAuthService.login(code);

        // 수정 전 로직:
        // return ResponseEntity.ok(ssafyOAuthService.login(code));
        //
        // 위 방식은 브라우저에 JSON 응답을 그대로 보여주기 때문에,
        // 모바일 앱 로그인 플로우에서는 callback의 마지막 단계로 적합하지 않습니다.

        // 앱 스킴(wow://)으로 다시 보내면서 프론트가 로그인 상태를 복원할 수 있는 값을 쿼리로 붙입니다.
        // SSAFY 계정은 일반 userId가 없을 수 있으므로 null 여부를 확인한 뒤에만 포함합니다.
        UriComponentsBuilder redirectBuilder = UriComponentsBuilder
                .fromUriString("wow://auth/ssafy/callback")
                .queryParam("accessToken", loginResponse.getAccessToken())
                .queryParam("refreshToken", loginResponse.getRefreshToken())
                .queryParam("expiresIn", loginResponse.getExpiresIn());

        if (loginResponse.getUser() != null) {
            if (loginResponse.getUser().getUserId() != null) {
                redirectBuilder.queryParam("userId", loginResponse.getUser().getUserId());
            }
            if (loginResponse.getUser().getName() != null) {
                redirectBuilder.queryParam("name", loginResponse.getUser().getName());
            }
            if (loginResponse.getUser().getLoginType() != null) {
                redirectBuilder.queryParam("loginType", loginResponse.getUser().getLoginType());
            }
        }

        // 최종적으로 앱 딥링크로 302 redirect를 보내서,
        // 프론트가 이 URL을 받아 로그인 상태 저장과 후속 화면 이동을 이어갈 수 있게 합니다.
        // 수정 전 로직:
        // response.sendRedirect(redirectBuilder.build(true).toUriString());
        //
        // build(true)는 이미 인코딩된 URL이라는 전제에서 동작합니다.
        // 하지만 실제 쿼리 파라미터에는 SSAFY 사용자 이름처럼 한글이 포함될 수 있어서,
        // 인코딩되지 않은 문자가 QUERY_PARAM 예외를 만들고 redirect가 실패했습니다.
        //
        // build().encode()를 사용하면 한글/특수문자가 안전하게 인코딩된 딥링크를 만들 수 있습니다.
        String redirectUrl = redirectBuilder
                .build()
                .encode()
                .toUriString();

        // 최종적으로 인코딩된 WOW 앱 딥링크로 302 redirect를 보냅니다.
        response.sendRedirect(redirectUrl);
    }
}
