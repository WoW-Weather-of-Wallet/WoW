package com.wow.domain.auth.service;

import com.wow.global.constant.RedisKeys;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InternalServerException;
import com.wow.global.exception.RateLimitException;
import com.wow.global.util.PhoneNumberUtils;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private static final long CODE_TTL_MINUTES = 5;
    private static final long SEND_COOLDOWN_SECONDS = 60;
    private static final long SEND_LIMIT_WINDOW_MINUTES = 60;
    private static final long MAX_SEND_COUNT_PER_WINDOW = 5;
    private static final long MAX_VERIFY_ATTEMPTS = 5;

    private static final long RATE_LIMIT_RESULT_COOLDOWN_EXISTS = -1L;
    private static final long RATE_LIMIT_RESULT_LIMIT_EXCEEDED = -2L;

    private static final DefaultRedisScript<Long> SEND_RATE_LIMIT_SCRIPT = SmsRateLimitScript.create();

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
            throw new BadRequestException("인증번호가 없거나 만료되었습니다.");
        }

        if (!MessageDigest.isEqual(
                savedCode.getBytes(StandardCharsets.UTF_8),
                code.getBytes(StandardCharsets.UTF_8))) {
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
            throw new BadRequestException("SMS 인증이 필요합니다.");
        }
    }

    public void consumeVerified(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        redisTemplate.delete(RedisKeys.SMS_VERIFIED_PREFIX + normalized);
    }

    public void consumeVerifiedAfterCommit(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    redisTemplate.delete(RedisKeys.SMS_VERIFIED_PREFIX + normalized);
                }
            });
            return;
        }

        redisTemplate.delete(RedisKeys.SMS_VERIFIED_PREFIX + normalized);
    }

    public void checkAndConsumeVerified(String phoneNumber) {
        checkVerified(phoneNumber);
        consumeVerified(phoneNumber);
    }

    private void validateSendRateLimit(String phoneNumber) {
        String countKey = RedisKeys.SMS_COUNT_PREFIX + phoneNumber;
        String cooldownKey = RedisKeys.SMS_COOLDOWN_PREFIX + phoneNumber;

        Long result = executeSendRateLimitScript(countKey, cooldownKey);

        if (result == null) {
            log.error("SMS rate limit Lua script returned null.");
            throw new InternalServerException("SMS 발송 중 문제가 발생했습니다.");
        }
        if (result == RATE_LIMIT_RESULT_COOLDOWN_EXISTS) {
            throw new RateLimitException("인증번호는 1분 뒤에 다시 요청할 수 있습니다.");
        }
        if (result == RATE_LIMIT_RESULT_LIMIT_EXCEEDED) {
            throw new RateLimitException("인증번호 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    Long executeSendRateLimitScript(String countKey, String cooldownKey) {
        return redisTemplate.execute(
                SEND_RATE_LIMIT_SCRIPT,
                List.of(countKey, cooldownKey),
                String.valueOf(SEND_LIMIT_WINDOW_MINUTES),
                String.valueOf(MAX_SEND_COUNT_PER_WINDOW),
                String.valueOf(SEND_COOLDOWN_SECONDS)
        );
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
            throw new RateLimitException("인증번호 입력 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.");
        }

        throw new BadRequestException("인증번호가 올바르지 않습니다.");
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
}
