package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 모든 비즈니스 예외가 IllegalArgumentException 하나로 처리되어 HTTP 상태코드 구분 불가 → 예외 계층 도입
public abstract class BusinessException extends RuntimeException {

    private final HttpStatus httpStatus;

    protected BusinessException(HttpStatus httpStatus, String message) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
