package com.wow.domain.user.controller;

import com.wow.domain.user.dto.NotificationSettingsResponse;
import com.wow.domain.user.dto.UpdateNotificationSettingsRequest;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.service.UserService;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@Tag(name = "User", description = "사용자 정보 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        // [added] 이유: @AuthenticationPrincipal이 null을 반환하면 NPE 발생 → null guard 추가
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @Operation(summary = "알림 설정 조회", description = "로그인한 사용자의 앱 푸시 알림 사용 여부를 조회합니다.")
    @GetMapping("/profile/notifications")
    public ResponseEntity<NotificationSettingsResponse> getNotificationSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new InvalidTokenException("?몄쬆???꾩슂?⑸땲??");
        }
        return ResponseEntity.ok(userService.getNotificationSettings(userDetails.getUsername()));
    }

    @Operation(summary = "회원탈퇴", description = "로그인한 사용자의 계정을 삭제합니다.")
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "회원 정보 수정", description = "로그인한 사용자의 이름, 성별, 생년월일을 수정합니다.")
    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @Operation(summary = "알림 설정 수정", description = "로그인한 사용자의 앱 푸시 알림 사용 여부를 수정합니다.")
    @PatchMapping("/profile/notifications")
    public ResponseEntity<NotificationSettingsResponse> updateNotificationSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateNotificationSettingsRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("?몄쬆???꾩슂?⑸땲??");
        }
        return ResponseEntity.ok(userService.updateNotificationSettings(userDetails.getUsername(), request));
    }

    @Operation(summary = "휴대폰 번호 수정", description = "SMS 인증 완료 후 휴대폰 번호를 변경합니다.")
    @PatchMapping("/phone")
    public ResponseEntity<Void> updatePhone(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody UpdatePhoneRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요합니다.");
        }
        userService.updatePhone(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

}
