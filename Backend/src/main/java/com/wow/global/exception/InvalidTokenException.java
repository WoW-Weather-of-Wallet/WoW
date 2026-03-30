package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 토큰 관련 인증 오류를 401 UNAUTHORIZED로 명확히 구분
public class InvalidTokenException extends BusinessException {

    public InvalidTokenException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
