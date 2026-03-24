package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 일반 클라이언트 요청 오류를 400 BAD_REQUEST로 명확히 구분
public class BadRequestException extends BusinessException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
