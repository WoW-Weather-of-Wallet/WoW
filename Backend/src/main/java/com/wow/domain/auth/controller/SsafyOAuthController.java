package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.service.SsafyOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @Operation(summary = "SSAFY 로그인 콜백", description = "기존 회원이면 JWT 발급 후 앱 딥링크로 리다이렉트, 신규 회원이면 전화번호 입력 화면으로 리다이렉트합니다.")
    @GetMapping("/callback")
    public void callback(@RequestParam String code, HttpServletResponse response) throws IOException {
        response.sendRedirect(ssafyOAuthService.login(code));
    }

    @Operation(summary = "SSAFY 신규 회원 중복 확인", description = "SMS 인증 전 이름, 성별, 생년월일, 전화번호로 중복 여부를 확인합니다.")
    @PostMapping("/check")
    public ResponseEntity<Void> checkDuplicate(@RequestBody SsafyCheckRequest request) {
        ssafyOAuthService.checkDuplicate(request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SSAFY 신규 회원 등록", description = "SMS 인증 완료 후 신규 SSAFY 회원을 등록하고 JWT를 발급합니다.")
    @PostMapping("/register")
    public ResponseEntity<UserLoginResponse> register(@RequestBody SsafyRegisterRequest request) {
        return ResponseEntity.ok(ssafyOAuthService.register(request));
    }

}
