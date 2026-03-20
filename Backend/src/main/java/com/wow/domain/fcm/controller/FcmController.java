package com.wow.domain.fcm.controller;

import com.wow.domain.fcm.dto.FcmSendRequest;
import com.wow.domain.fcm.dto.FcmTokenRequest;
import com.wow.domain.fcm.service.FcmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "FCM", description = "FCM 토큰 관리 및 알림 전송 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fcm")
public class FcmController {

    private final FcmService fcmService;

    @Operation(summary = "FCM 토큰 등록", description = "기기의 FCM 토큰을 등록합니다. 이미 등록된 토큰이면 무시됩니다.")
    @PostMapping("/token")
    public ResponseEntity<Void> registerToken(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FcmTokenRequest request) {
        fcmService.registerToken(userDetails.getUsername(), request.getToken(), request.getDeviceType());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "FCM 토큰 삭제", description = "로그아웃 시 해당 기기의 FCM 토큰을 삭제합니다.")
    @DeleteMapping("/token")
    public ResponseEntity<Void> deleteToken(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FcmTokenRequest request) {
        fcmService.deleteToken(userDetails.getUsername(), request.getToken());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "FCM 테스트 전송", description = "본인에게 테스트 알림을 전송합니다.")
    @PostMapping("/test")
    public ResponseEntity<Void> sendTest(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FcmSendRequest request) {
        fcmService.sendToUser(userDetails.getUsername(), request.getTitle(), request.getBody());
        return ResponseEntity.ok().build();
    }

}
