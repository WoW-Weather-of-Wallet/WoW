package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.*;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @PostMapping("/signup")
    public ResponseEntity<UserCreateResponse> signup(@RequestBody UserCreateRequest request) {

        UserCreateResponse response = authService.signup(request);

        return ResponseEntity.ok(response);

    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request) {

        UserLoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);

    }

    @PostMapping("/sms/send")
    public ResponseEntity<Void> sendSms(@RequestBody SmsSendRequest request) {
        smsService.sendCode(request.getPhoneNumber());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sms/verify")
    public ResponseEntity<Void> verifySms(@RequestBody SmsVerifyRequest request) {
        smsService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok().build();
    }

}
