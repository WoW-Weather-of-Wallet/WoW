package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// 내부 처리 실패를 명시적인 500 도메인 예외로 표현하기 위한 예외 클래스
public class InternalServerException extends BusinessException {

    public InternalServerException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    public InternalServerException(String message, Throwable cause) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, message);
        initCause(cause);
    }
}
