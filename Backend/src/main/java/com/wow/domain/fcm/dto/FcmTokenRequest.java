package com.wow.domain.fcm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class FcmTokenRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Pattern(regexp = "android|ios", message = "deviceType은 android 또는 ios여야 합니다.")
    private String deviceType;

}
