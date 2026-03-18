package com.wow.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserIdCheckResponse {

    private boolean isAvailable;
    private String message;
    private String userId;

}
