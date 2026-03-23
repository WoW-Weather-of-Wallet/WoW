package com.wow.domain.user.controller;

import com.wow.domain.user.dto.NotificationSettingsResponse;
import com.wow.domain.user.dto.TermsAgreeRequest;
import com.wow.domain.user.dto.TermsAgreeResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User", description = "User management API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get user profile", description = "Returns the current user's profile.")
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @Operation(summary = "Save term agreements", description = "Saves agreement history for the current user.")
    @PostMapping("/terms/agree")
    public ResponseEntity<TermsAgreeResponse> agreeTerms(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TermsAgreeRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        return ResponseEntity.ok(userService.agreeTerms(userDetails.getUsername(), request));
    }

    @Operation(summary = "Get notification settings", description = "Returns notification settings for the current user.")
    @GetMapping("/profile/notifications")
    public ResponseEntity<NotificationSettingsResponse> getNotificationSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        return ResponseEntity.ok(userService.getNotificationSettings(userDetails.getUsername()));
    }

    @Operation(summary = "Delete user", description = "Deletes the current user's account.")
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update user profile", description = "Updates profile fields for the current user.")
    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @Operation(summary = "Update notification settings", description = "Updates notification settings for the current user.")
    @PatchMapping("/profile/notifications")
    public ResponseEntity<NotificationSettingsResponse> updateNotificationSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateNotificationSettingsRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        return ResponseEntity.ok(userService.updateNotificationSettings(userDetails.getUsername(), request));
    }

    @Operation(summary = "Update phone number", description = "Updates the current user's phone number after SMS verification.")
    @PatchMapping("/phone")
    public ResponseEntity<Void> updatePhone(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdatePhoneRequest request) {
        if (userDetails == null) {
            throw new InvalidTokenException("Authentication is required.");
        }
        userService.updatePhone(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }
}
