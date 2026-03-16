package com.wow.domain.user.controller;

import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @Operation(summary = "회원탈퇴", description = "로그인한 사용자의 계정을 삭제합니다.")
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "회원 정보 수정", description = "로그인한 사용자의 이름(일반 회원만), 성별, 생년월일을 수정합니다.")
    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @Operation(summary = "휴대폰 번호 수정", description = "SMS 인증 완료 후 휴대폰 번호를 변경합니다.")
    @PatchMapping("/phone")
    public ResponseEntity<Void> updatePhone(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody UpdatePhoneRequest request) {
        userService.updatePhone(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

}
