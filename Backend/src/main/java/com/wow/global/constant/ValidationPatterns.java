package com.wow.global.constant;

public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    public static final String USER_ID = "^(?=.*[a-z])[a-z0-9]{4,20}$";
    public static final String GENDER = "^[MF]$";
    // [fix] 수정 전: "^01\\d-?\\d{3,4}-?\\d{4}$" | 이유: 01 뒤에 아무 숫자나 허용하여 유효하지 않은 한국 모바일 프리픽스(012~015 등) 통과
    public static final String PHONE_NUMBER = "^01[016789]-?\\d{3,4}-?\\d{4}$";
    public static final String SMS_CODE = "^\\d{6}$";
}
