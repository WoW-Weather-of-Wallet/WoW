package com.wow.domain.auth.service;

import org.springframework.data.redis.core.script.DefaultRedisScript;

/**
 * 로그인 API에 적용하는 Rate Limit Lua 스크립트.
 *
 * [added] 이유: 기존 checkLoginRateLimit(hasKey) → incrementLoginAttempts(increment) 구조는
 *              두 연산 사이에 다른 요청이 끼어들 수 있는 TOCTOU 레이스 컨디션이 존재함
 *              → PublicAuthRateLimitScript와 동일하게 Lua 스크립트로 원자 처리
 *
 * 동작 방식:
 *   - 로그인 시도 전에 원자적으로 차단 여부 확인 + 시도 횟수 증가
 *   - 로그인 성공 시 resetLoginAttempts()로 카운터 초기화 (별도 호출)
 *   - 로그인 실패 시 카운터가 그대로 유지되어 누적됨
 *
 * 반환값:
 *   -1  : 이미 차단됨 (blockKey 존재)
 *   -2  : 이번 요청으로 한도 초과, 신규 차단 적용
 *   1~N : 현재 시도 횟수 (정상 통과)
 *
 * KEYS[1] = attemptKey (시도 횟수 카운터)
 * KEYS[2] = blockKey   (차단 플래그)
 * ARGV[1] = windowSeconds (시도 횟수 키 TTL, 초)
 * ARGV[2] = maxAttempts   (최대 허용 시도 횟수)
 * ARGV[3] = blockSeconds  (차단 키 TTL, 초)
 */
public final class LoginRateLimitScript {

    private LoginRateLimitScript() {
    }

    public static DefaultRedisScript<Long> create() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setResultType(Long.class);
        script.setScriptText("""
                local attemptKey = KEYS[1]
                local blockKey = KEYS[2]
                local windowSeconds = tonumber(ARGV[1])
                local maxAttempts = tonumber(ARGV[2])
                local blockSeconds = tonumber(ARGV[3])

                -- 이미 차단된 상태이면 즉시 -1 반환
                if redis.call('EXISTS', blockKey) == 1 then
                    return -1
                end

                -- 시도 횟수 증가 및 첫 번째 요청 시 TTL 설정 (원자적 처리)
                local attempts = redis.call('INCR', attemptKey)
                if attempts == 1 then
                    redis.call('EXPIRE', attemptKey, windowSeconds)
                end

                -- 한도 초과 시 차단 키 설정 후 -2 반환
                if attempts > maxAttempts then
                    redis.call('SET', blockKey, 'blocked', 'EX', blockSeconds)
                    redis.call('DEL', attemptKey)
                    return -2
                end

                return attempts
                """);
        return script;
    }
}
