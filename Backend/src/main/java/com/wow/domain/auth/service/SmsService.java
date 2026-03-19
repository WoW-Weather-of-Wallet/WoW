package com.wow.domain.auth.service;

import com.wow.global.constant.RedisKeys;
import com.wow.global.util.PhoneNumberUtils;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final long CODE_TTL_MINUTES = 5;
    private static final long SEND_COOLDOWN_SECONDS = 60;
    private static final long SEND_LIMIT_WINDOW_MINUTES = 60;
    private static final long MAX_SEND_COUNT_PER_WINDOW = 5;
    private static final long MAX_VERIFY_ATTEMPTS = 5;

    private static final long RATE_LIMIT_RESULT_COOLDOWN_EXISTS = -1L;
    private static final long RATE_LIMIT_RESULT_LIMIT_EXCEEDED = -2L;

    private static final DefaultRedisScript<Long> SEND_RATE_LIMIT_SCRIPT = createSendRateLimitScript();

    private final StringRedisTemplate redisTemplate;
    private final DefaultMessageService messageService;

    @Value("${solapi.sender}")
    private String sender;

    public void sendCode(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        validateSendRateLimit(normalized);

        String code = generateCode();
        redisTemplate.opsForValue().set(
                RedisKeys.SMS_CODE_PREFIX + normalized,
                code,
                Duration.ofMinutes(CODE_TTL_MINUTES)
        );

        Message message = new Message();
        message.setFrom(sender);
        message.setTo(normalized);
        message.setText("[WoW] 인증번호 [" + code + "]를 입력해주세요.");

        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
        } catch (RuntimeException e) {
            rollbackSendState(normalized);
            throw e;
        }
    }

    public void verifyCode(String phoneNumber, String code) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        String savedCode = redisTemplate.opsForValue().get(RedisKeys.SMS_CODE_PREFIX + normalized);

        if (savedCode == null) {
            throw new IllegalArgumentException("인증번호가 만료되었거나 존재하지 않습니다.");
        }

        if (!savedCode.equals(code)) {
            handleVerifyFailure(normalized);
        }

        redisTemplate.delete(RedisKeys.SMS_CODE_PREFIX + normalized);
        redisTemplate.delete(RedisKeys.SMS_VERIFY_COUNT_PREFIX + normalized);
        redisTemplate.opsForValue().set(
                RedisKeys.SMS_VERIFIED_PREFIX + normalized,
                "true",
                Duration.ofMinutes(30)
        );
    }

    public void checkVerified(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        String verified = redisTemplate.opsForValue().get(RedisKeys.SMS_VERIFIED_PREFIX + normalized);
        if (!"true".equals(verified)) {
            throw new IllegalArgumentException("휴대폰 인증이 필요합니다.");
        }
    }

    public void deleteVerified(String phoneNumber) {
        redisTemplate.delete(RedisKeys.SMS_VERIFIED_PREFIX + PhoneNumberUtils.normalize(phoneNumber));
    }

    private void validateSendRateLimit(String phoneNumber) {
        String countKey = RedisKeys.SMS_COUNT_PREFIX + phoneNumber;
        String cooldownKey = RedisKeys.SMS_COOLDOWN_PREFIX + phoneNumber;

        Long result = redisTemplate.execute(
                SEND_RATE_LIMIT_SCRIPT,
                List.of(countKey, cooldownKey),
                String.valueOf(SEND_LIMIT_WINDOW_MINUTES),
                String.valueOf(MAX_SEND_COUNT_PER_WINDOW),
                String.valueOf(SEND_COOLDOWN_SECONDS)
        );

        if (result == null) {
            throw new IllegalStateException("SMS 전송 제한 처리에 실패했습니다.");
        }
        if (result == RATE_LIMIT_RESULT_COOLDOWN_EXISTS) {
            throw new IllegalArgumentException("인증번호는 1분 후에 다시 요청할 수 있습니다.");
        }
        if (result == RATE_LIMIT_RESULT_LIMIT_EXCEEDED) {
            throw new IllegalArgumentException("인증번호 요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private void handleVerifyFailure(String phoneNumber) {
        String verifyCountKey = RedisKeys.SMS_VERIFY_COUNT_PREFIX + phoneNumber;
        Long verifyCount = redisTemplate.opsForValue().increment(verifyCountKey);

        if (verifyCount != null && verifyCount == 1L) {
            redisTemplate.expire(verifyCountKey, Duration.ofMinutes(CODE_TTL_MINUTES));
        }

        if (verifyCount != null && verifyCount >= MAX_VERIFY_ATTEMPTS) {
            redisTemplate.delete(RedisKeys.SMS_CODE_PREFIX + phoneNumber);
            redisTemplate.delete(verifyCountKey);
            throw new IllegalArgumentException("인증번호 입력 횟수가 초과되었습니다. 인증번호를 다시 요청해주세요.");
        }

        throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
    }

    private void rollbackSendState(String phoneNumber) {
        String countKey = RedisKeys.SMS_COUNT_PREFIX + phoneNumber;
        String cooldownKey = RedisKeys.SMS_COOLDOWN_PREFIX + phoneNumber;
        String codeKey = RedisKeys.SMS_CODE_PREFIX + phoneNumber;
        String verifyCountKey = RedisKeys.SMS_VERIFY_COUNT_PREFIX + phoneNumber;

        redisTemplate.delete(codeKey);
        redisTemplate.delete(cooldownKey);
        redisTemplate.delete(verifyCountKey);

        Long updatedCount = redisTemplate.opsForValue().decrement(countKey);
        if (updatedCount != null && updatedCount <= 0) {
            redisTemplate.delete(countKey);
        }
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    private static DefaultRedisScript<Long> createSendRateLimitScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setResultType(Long.class);
        script.setScriptText("""
                local countKey = KEYS[1]
                local cooldownKey = KEYS[2]
                local windowMinutes = tonumber(ARGV[1])
                local maxSendCount = tonumber(ARGV[2])
                local cooldownSeconds = tonumber(ARGV[3])

                if redis.call('EXISTS', cooldownKey) == 1 then
                    return -1
                end

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
