package com.wow.domain.auth.controller;

import com.wow.domain.auth.service.SsafyOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/sso/providers/ssafy")
@RequiredArgsConstructor
public class SsafyOAuthController {

    private final SsafyOAuthService ssafyOAuthService;

    // 1. SSAFY 로그인 페이지로 리다이렉트
    @GetMapping("/login")
    public void login(HttpServletResponse response) throws IOException {
        String loginUrl = ssafyOAuthService.getLoginUrl();
        response.sendRedirect(loginUrl);
    }

    // 2. 인가코드 콜백
    @GetMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam String code) {
        return ResponseEntity.ok(ssafyOAuthService.login(code));
    }


}
