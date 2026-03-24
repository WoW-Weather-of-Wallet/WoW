package com.wow.domain.auth.service;

import org.springframework.data.redis.core.script.DefaultRedisScript;

/**
 * SMS 전송 rate limit Lua 스크립트.
 *
 * 쿨다운(cooldownKey)은 정상 발송과 한도 초과 양쪽에서 모두 설정된다.
 * 이는 의도된 설계로, 매 발송마다 cooldownSeconds(60초) 재발송 대기를 강제한다.
 *
 * [참고] SmsService.rollbackSendState()에서 발송 실패 시 cooldownKey를 삭제하는 것도 의도된 동작이다.
 *        SMS 전송 자체가 실패한 경우 사용자가 즉시 재시도할 수 있도록 쿨다운을 해제한다.
 *        단, countKey는 감소 처리하여 창(window) 내 횟수는 유지한다.
 *
 * 반환값:
 *   -1  : cooldown 중 (재발송 불가)
 *   -2  : 창 내 전송 한도 초과
 *   1~N : 현재 발송 횟수 (정상)
 *
 * KEYS[1] = countKey    (창 내 발송 횟수 카운터)
 * KEYS[2] = cooldownKey (재발송 쿨다운 플래그)
 * ARGV[1] = windowMinutes  (횟수 카운터 TTL, 분)
 * ARGV[2] = maxSendCount   (창 내 최대 발송 횟수)
 * ARGV[3] = cooldownSeconds (쿨다운 TTL, 초)
 */
public final class SmsRateLimitScript {

    private SmsRateLimitScript() {
    }

    public static DefaultRedisScript<Long> create() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setResultType(Long.class);
        script.setScriptText("""
                local countKey = KEYS[1]
                local cooldownKey = KEYS[2]
                local windowMinutes = tonumber(ARGV[1])
                local maxSendCount = tonumber(ARGV[2])
                local cooldownSeconds = tonumber(ARGV[3])

                -- Cooldown이 살아 있으면 즉시 차단한다.
                if redis.call('EXISTS', cooldownKey) == 1 then
                    return -1
                end

                -- 전송 횟수 증가와 TTL 설정을 같은 스크립트에서 처리한다.
                local sendCount = redis.call('INCR', countKey)
                if sendCount == 1 then
                    redis.call('EXPIRE', countKey, windowMinutes * 60)
                end

                -- 한도 초과 시 cooldown을 설정하고 차단 코드(-2)를 반환한다.
                if sendCount > maxSendCount then
                    redis.call('SET', cooldownKey, 'true', 'EX', cooldownSeconds)
                    return -2
                end

                -- 정상 발송 시에도 cooldown을 설정한다 (재발송 간격 강제).
                -- rollbackSendState()에서 발송 실패 시 이 cooldownKey를 삭제하여 즉시 재시도를 허용한다.
                redis.call('SET', cooldownKey, 'true', 'EX', cooldownSeconds)
                return sendCount
                """);
        return script;
    }
}
