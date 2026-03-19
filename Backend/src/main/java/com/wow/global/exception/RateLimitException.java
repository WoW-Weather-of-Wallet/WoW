package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 요청 횟수 초과를 429 TOO_MANY_REQUESTS로 명확히 구분
public class RateLimitException extends BusinessException {

    public RateLimitException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
