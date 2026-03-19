package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 중복 리소스 충돌을 409 CONFLICT로 명확히 구분
public class DuplicateException extends BusinessException {

    public DuplicateException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
