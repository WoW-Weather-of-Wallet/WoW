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
    public static final String SSAFY_STATE_PREFIX = "ssafy:state:";

    public static final String LOGIN_ATTEMPT_PREFIX = "login:attempt:";
    public static final String LOGIN_BLOCK_PREFIX = "login:block:";

    // [added] 이유: 공개 인증 API에도 로그인과 동일한 수준의 시도 제한을 적용하기 위한 Redis 키 분리
    public static final String USER_ID_CHECK_ATTEMPT_PREFIX = "auth:check-user-id:attempt:";
    public static final String USER_ID_CHECK_BLOCK_PREFIX = "auth:check-user-id:block:";
    public static final String FIND_ID_ATTEMPT_PREFIX = "auth:find-id:attempt:";
    public static final String FIND_ID_BLOCK_PREFIX = "auth:find-id:block:";
    public static final String FIND_PASSWORD_ATTEMPT_PREFIX = "auth:find-password:attempt:";
    public static final String FIND_PASSWORD_BLOCK_PREFIX = "auth:find-password:block:";

    public static final String SPENDING_MONTHLY_COMPARE_PREFIX = "spending:monthly:compare:";
    public static final String AI_MONTHLY_REPORT_PREFIX = "ai:monthly:report:";
}
