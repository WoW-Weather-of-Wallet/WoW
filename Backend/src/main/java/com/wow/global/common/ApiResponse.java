package com.wow.global.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private int httpStatusCode;
    private String responseMessage;
    private T data;

    // 성공 응답을 정적 팩토리 메서드로 간단하게 생성
    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return new ApiResponse<>(status, message, data);
    }
}