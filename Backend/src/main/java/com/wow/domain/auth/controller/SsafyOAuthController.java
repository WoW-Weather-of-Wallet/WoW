package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.ssafy.ExchangeTokenRequest;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.auth.service.SsafyOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@Tag(name = "SSAFY OAuth", description = "SSAFY 로그인/회원가입 관련 API")
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
    public void callback(@RequestParam String code,
                         @RequestParam String state,
                         HttpServletResponse response) throws IOException {
        response.sendRedirect(ssafyOAuthService.login(code, state));
    }

    // [fix] 수정 전: @GetMapping("/token") + @RequestParam | 이유: GET 요청 시 auth code가 서버 로그/브라우저 히스토리/referrer에 노출 → POST로 변경
    // [fix] 수정 전: @RequestParam String code | 이유: POST여도 쿼리스트링은 서버 access log에 기록됨 → @RequestBody로 이동
    @Operation(summary = "SSAFY 로그인 토큰 교환", description = "딥링크로 받은 일회성 code를 JWT로 교환합니다.")
    @PostMapping("/token")
    public ResponseEntity<UserLoginResponse> exchangeToken(@Valid @RequestBody ExchangeTokenRequest request) {
        return ResponseEntity.ok(ssafyOAuthService.exchangeToken(request.getCode()));
    }

    @Operation(summary = "SSAFY 신규 회원 중복 확인", description = "SMS 인증 전 이름, 성별, 생년월일, 전화번호로 중복 여부를 확인합니다.")
    @PostMapping("/check")
    public ResponseEntity<Void> checkDuplicate(@Valid @RequestBody SsafyCheckRequest request) {
        ssafyOAuthService.checkDuplicate(request);
        return ResponseEntity.ok().build();
    }

    // [fix] 수정 전: ResponseEntity.ok() → 200 | 이유: 리소스 생성 시 201 Created가 HTTP 표준
    @Operation(summary = "SSAFY 신규 회원 등록", description = "SMS 인증 완료 후 신규 SSAFY 회원을 등록하고 JWT를 발급합니다.")
    @PostMapping("/register")
    public ResponseEntity<UserLoginResponse> register(@Valid @RequestBody SsafyRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ssafyOAuthService.register(request));
    }
}
