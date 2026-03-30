package com.wow.domain.auth.controller;

import com.wow.domain.auth.dto.ChangePasswordRequest;
import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
import com.wow.domain.auth.dto.SignupIdentityCheckRequest;
import com.wow.domain.auth.dto.SmsSendRequest;
import com.wow.domain.auth.dto.SmsVerifyRequest;
import com.wow.domain.auth.dto.TokenRefreshRequest;
import com.wow.domain.auth.dto.TokenRefreshResponse;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.auth.dto.UserCreateResponse;
import com.wow.domain.auth.dto.UserIdCheckResponse;
import com.wow.domain.auth.dto.UserLoginRequest;
import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "회원 인증과 계정 관리를 위한 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @Operation(summary = "아이디 중복 확인", description = "회원가입 전에 아이디 사용 가능 여부를 확인합니다.")
    @GetMapping("/check-user-id")
    public ResponseEntity<UserIdCheckResponse> checkUserId(@RequestParam String userId) {
        return ResponseEntity.ok(authService.checkUserId(userId));
    }

    @Operation(summary = "회원가입 동일인 중복 확인", description = "이름, 성별, 생년월일, 휴대폰번호로 기존 가입 여부를 확인합니다.")
    @PostMapping("/check-signup-identity")
    public ResponseEntity<Void> checkSignupIdentity(@Valid @RequestBody SignupIdentityCheckRequest request) {
        authService.checkSignupIdentity(request);
        return ResponseEntity.ok().build();
    }

    // [fix] 수정 전: ResponseEntity.ok() → 200 OK | 이유: 리소스 생성 시 201 Created가 HTTP 표준
    @Operation(summary = "회원가입", description = "일반 회원가입을 진행합니다.")
    @PostMapping("/signup")
    public ResponseEntity<UserCreateResponse> signup(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @Operation(summary = "로그인", description = "아이디와 비밀번호로 로그인하고 JWT를 발급합니다.")
    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "SMS 인증번호 전송", description = "휴대폰 번호로 인증번호를 전송합니다.")
    @PostMapping("/sms/send")
    public ResponseEntity<Void> sendSms(@Valid @RequestBody SmsSendRequest request) {
        smsService.sendCode(request.getPhoneNumber());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "SMS 인증번호 확인", description = "전송된 인증번호를 검증합니다. 성공 시 30분 동안 인증 상태를 유지합니다.")
    @PostMapping("/sms/verify")
    public ResponseEntity<Void> verifySms(@Valid @RequestBody SmsVerifyRequest request) {
        smsService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Access Token 재발급", description = "Refresh Token으로 새로운 Access Token을 발급합니다.")
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @Operation(summary = "로그아웃", description = "저장된 Refresh Token을 삭제합니다.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        // [added] 이유: @AuthenticationPrincipal이 null을 반환하면 NPE 발생 → null guard 추가
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        authService.logout(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "아이디 찾기", description = "이름, 성별, 생년월일, 휴대폰 인증으로 아이디를 조회합니다.")
    @PostMapping("/find/id")
    public ResponseEntity<FindIdResponse> findId(@Valid @RequestBody FindIdRequest request) {
        return ResponseEntity.ok(authService.findId(request));
    }

    @Operation(summary = "비밀번호 찾기", description = "본인 확인 후 비밀번호를 새 값으로 변경합니다.")
    @PostMapping("/find/password")
    public ResponseEntity<Void> findPassword(@Valid @RequestBody FindPwRequest request) {
        authService.findPassword(request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "비밀번호 변경", description = "로그인한 사용자의 비밀번호를 변경합니다.")
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        // [added] 이유: @AuthenticationPrincipal이 null을 반환하면 NPE 발생 → null guard 추가
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }
}
