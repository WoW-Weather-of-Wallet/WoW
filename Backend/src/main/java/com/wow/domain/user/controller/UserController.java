package com.wow.domain.user.controller;

import com.wow.domain.user.dto.OnboardingRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/onboarding")
    public ResponseEntity<UserProfileResponse> onboarding(@AuthenticationPrincipal UserDetails userDetails,
                                                          @RequestBody OnboardingRequest request) {
        return ResponseEntity.ok(userService.onboarding(userDetails.getUsername(), request));
    }

}
