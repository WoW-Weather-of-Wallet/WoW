package com.wow.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private int httpStatusCode;
    private String responseMessage;
    private T data;

    // 성공 응답 생성을 위한 정적 팩토리 메서드
    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return new ApiResponse<>(status, message, data);
    }
}
