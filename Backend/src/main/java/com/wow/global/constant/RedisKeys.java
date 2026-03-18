package com.wow.global.constant;

public final class RedisKeys {

    private RedisKeys() {
    }

    public static final String REFRESH_TOKEN_PREFIX = "refresh:";

    public static final String SMS_VERIFIED_PREFIX = "sms:verified:";
    public static final String SMS_CODE_PREFIX = "sms:code:";
    public static final String SMS_COOLDOWN_PREFIX = "sms:cooldown:";
    public static final String SMS_COUNT_PREFIX = "sms:count:";
    public static final String SMS_VERIFY_COUNT_PREFIX = "sms:verify:count:";

    public static final String SSAFY_PENDING_PREFIX = "ssafy:pending:";
    public static final String SSAFY_AUTH_CODE_PREFIX = "ssafy:code:";
}
