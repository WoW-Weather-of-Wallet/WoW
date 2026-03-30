package com.wow.domain.fcm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class FcmSendRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String body;

}
