package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.*;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "일반 로그인/회원가입 및 SMS 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @Operation(summary = "일반 회원가입", description = "아이디/비밀번호로 회원가입합니다.")
    @PostMapping("/signup")
    public ResponseEntity<UserCreateResponse> signup(@RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @Operation(summary = "일반 로그인", description = "아이디/비밀번호로 로그인하고 JWT를 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "SMS 인증번호 발송", description = "입력한 휴대폰 번호로 6자리 인증번호를 발송합니다.")
    @PostMapping("/sms/send")
    public ResponseEntity<Void> sendSms(@RequestBody SmsSendRequest request) {
        smsService.sendCode(request.getPhoneNumber());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SMS 인증번호 확인", description = "발송된 인증번호를 검증합니다. 인증 성공 시 30분간 인증 상태가 유지됩니다.")
    @PostMapping("/sms/verify")
    public ResponseEntity<Void> verifySms(@RequestBody SmsVerifyRequest request) {
        smsService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok().build();
    }

}
