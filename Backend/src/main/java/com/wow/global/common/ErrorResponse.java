package com.wow.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    private int httpStatusCode;
    private String errorMessage;

    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message);
    }
}
