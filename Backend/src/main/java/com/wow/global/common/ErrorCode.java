package com.wow.global.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    INVALID_STAGE_ID("존재하지 않는 스테이지 번호", 400),
    USER_NOT_FOUND("사용자를 찾을 수 없습니다", 404),
    DUPLICATE_TRANSACTION("이미 같은 날짜 거래내역이 존재합니다", 409);

    private final String message;
    private final int status;
}