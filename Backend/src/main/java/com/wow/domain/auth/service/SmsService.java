package com.wow.domain.auth.service;

import com.wow.global.constant.RedisKeys;
import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final long CODE_TTL_MINUTES = 5;
    private static final long SEND_COOLDOWN_SECONDS = 60;
    private static final long SEND_LIMIT_WINDOW_MINUTES = 60;
    private static final long MAX_SEND_COUNT_PER_WINDOW = 5;
    private static final long MAX_VERIFY_ATTEMPTS = 5;

    private final StringRedisTemplate redisTemplate;
    private final DefaultMessageService messageService;

    @Value("${solapi.sender}")
    private String sender;

    public void sendCode(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);

        /*
         * 수정 이유:
         * - 같은 번호로 무제한 SMS 발송이 가능하면 스팸/비용 문제가 생깁니다.
         * - 짧은 재전송 쿨다운과 시간당 발송 횟수 제한을 추가해 abuse를 줄이도록 변경했습니다.
         *
         * 수정 전 코드:
         * - String code = generateCode();
         * - redisTemplate.opsForValue().set(...)
         * - messageService.sendOne(...)
         */
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
            /*
             * 수정 이유:
             * - 외부 SMS 발송이 실패했는데 Redis의 code/cooldown/count가 남으면 사용자는 문자를 못 받았는데도 재시도가 막힐 수 있습니다.
             * - 전송 실패 시 발송 관련 상태를 롤백해 정합성을 맞추도록 변경했습니다.
             *
             * 수정 전 코드:
             * - messageService.sendOne(new SingleMessageSendingRequest(message));
             */
            rollbackSendState(normalized);
            throw e;
        }
    }

    public void verifyCode(String phoneNumber, String code) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        String savedCode = redisTemplate.opsForValue().get(RedisKeys.SMS_CODE_PREFIX + normalized);

        if (savedCode == null) {
            throw new IllegalArgumentException("인증번호가 만료되었습니다.");
        }

        /*
         * 수정 이유:
         * - 기존에는 인증번호 검증 실패 횟수 제한이 없어 코드 유효 시간 동안 반복 대입이 가능했습니다.
         * - 실패 횟수를 Redis에 누적하고 제한 초과 시 인증번호를 폐기해 brute-force 가능성을 줄입니다.
         *
         * 수정 전 코드:
         * - if (!savedCode.equals(code)) {
         * -     throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
         * - }
         */
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
        String cooldownKey = RedisKeys.SMS_COOLDOWN_PREFIX + phoneNumber;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            throw new IllegalArgumentException("인증번호는 1분 후에 다시 요청해주세요.");
        }

        String countKey = RedisKeys.SMS_COUNT_PREFIX + phoneNumber;
        Long sendCount = redisTemplate.opsForValue().increment(countKey);
        if (sendCount != null && sendCount == 1L) {
            redisTemplate.expire(countKey, Duration.ofMinutes(SEND_LIMIT_WINDOW_MINUTES));
        }

        if (sendCount != null && sendCount > MAX_SEND_COUNT_PER_WINDOW) {
            throw new IllegalArgumentException("인증번호 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
        }

        redisTemplate.opsForValue().set(
                cooldownKey,
                "true",
                Duration.ofSeconds(SEND_COOLDOWN_SECONDS)
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
            throw new IllegalArgumentException("인증번호 입력 횟수를 초과했습니다. 인증번호를 다시 요청해주세요.");
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
}
