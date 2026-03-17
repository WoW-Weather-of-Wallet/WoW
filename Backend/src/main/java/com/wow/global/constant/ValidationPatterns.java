package com.wow.global.constant;

public final class ValidationPatterns {

    private ValidationPatterns() {
    }

    public static final String GENDER = "^[MF]$";
    public static final String PHONE_NUMBER = "^01\\d-?\\d{3,4}-?\\d{4}$";
    public static final String SMS_CODE = "^\\d{6}$";
}
