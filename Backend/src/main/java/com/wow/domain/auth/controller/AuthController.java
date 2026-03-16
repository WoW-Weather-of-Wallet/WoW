package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.*;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "일반 로그인/회원가입 및 SMS 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @Operation(summary = "아이디 중복 확인", description = "사용하려는 아이디의 중복 여부를 확인합니다.")
    @GetMapping("/check-user-id")
    public ResponseEntity<UserIdCheckResponse> checkUserId(@RequestParam String userId) {
        return ResponseEntity.ok(authService.checkUserId(userId));
    }

    @Operation(summary = "일반 회원가입", description = "아이디/비밀번호로 회원가입합니다.")
    @PostMapping("/signup")
    public ResponseEntity<UserCreateResponse> signup(@Valid @RequestBody UserCreateRequest request) {
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

    @Operation(summary = "Access Token 재발급", description = "Refresh Token으로 새로운 Access Token을 발급받습니다.")
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @Operation(summary = "로그아웃", description = "Redis에서 Refresh Token을 삭제합니다.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "아이디 찾기", description = "이름, 생년월일, 전화번호 SMS 인증 완료 후 아이디를 반환합니다.")
    @PostMapping("/find/id")
    public ResponseEntity<FindIdResponse> findId(@RequestBody FindIdRequest request) {
        return ResponseEntity.ok(authService.findId(request));
    }

    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호를 확인 후 새 비밀번호로 변경합니다. (일반 회원 전용)")
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

}
