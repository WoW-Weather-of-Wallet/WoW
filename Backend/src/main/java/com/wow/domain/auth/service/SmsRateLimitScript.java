package com.wow.domain.auth.service;

import org.springframework.data.redis.core.script.DefaultRedisScript;

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

                if sendCount > maxSendCount then
                    redis.call('SET', cooldownKey, 'true', 'EX', cooldownSeconds)
                    return -2
                end

                redis.call('SET', cooldownKey, 'true', 'EX', cooldownSeconds)
                return sendCount
                """);
        return script;
    }
}
