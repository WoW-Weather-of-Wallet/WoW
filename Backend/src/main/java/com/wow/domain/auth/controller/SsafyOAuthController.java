package com.wow.domain.auth.controller;

import com.wow.domain.auth.service.SsafyOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@Tag(name = "SSAFY OAuth", description = "SSAFY SSO 로그인 API")
@RestController
@RequestMapping("/sso/providers/ssafy")
@RequiredArgsConstructor
public class SsafyOAuthController {

    private final SsafyOAuthService ssafyOAuthService;

    @Operation(summary = "SSAFY 로그인 페이지로 이동", description = "SSAFY SSO 로그인 페이지로 리다이렉트합니다.")
    @GetMapping("/login")
    public void login(HttpServletResponse response) throws IOException {
        response.sendRedirect(ssafyOAuthService.getLoginUrl());
    }

    @Operation(summary = "SSAFY 로그인 콜백", description = "SSAFY SSO 인가코드를 받아 로그인 처리 후 JWT를 발급합니다.")
    @GetMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam String code) {
        return ResponseEntity.ok(ssafyOAuthService.login(code));
    }

}
