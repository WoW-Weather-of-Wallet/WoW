package com.wow.global.exception;

import org.springframework.http.HttpStatus;

// [added] 이유: 존재하지 않는 리소스 조회를 404 NOT_FOUND로 명확히 구분
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
