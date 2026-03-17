package com.wow.domain.auth.service;

import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.wow.global.util.PhoneNumberUtils;
import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final long CODE_TTL_MINUTES = 5;
    private static final long SEND_COOLDOWN_SECONDS = 60;
    private static final long SEND_LIMIT_WINDOW_MINUTES = 60;
    private static final long MAX_SEND_COUNT_PER_WINDOW = 5;
    private static final String VERIFIED_KEY_PREFIX = "sms:verified:";
    private static final String CODE_KEY_PREFIX = "sms:code:";
    private static final String SEND_COOLDOWN_KEY_PREFIX = "sms:cooldown:";
    private static final String SEND_COUNT_KEY_PREFIX = "sms:count:";

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
                CODE_KEY_PREFIX + normalized,
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
        String savedCode = redisTemplate.opsForValue().get(CODE_KEY_PREFIX + normalized);

        if (savedCode == null) {
            throw new IllegalArgumentException("인증번호가 만료되었습니다.");
        }
        if (!savedCode.equals(code)) {
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }

        redisTemplate.delete(CODE_KEY_PREFIX + normalized);

        redisTemplate.opsForValue().set(
                VERIFIED_KEY_PREFIX + normalized,
                "true",
                Duration.ofMinutes(30)
        );
    }

    public void checkVerified(String phoneNumber) {
        String normalized = PhoneNumberUtils.normalize(phoneNumber);
        String verified = redisTemplate.opsForValue().get(VERIFIED_KEY_PREFIX + normalized);
        if (!"true".equals(verified)) {
            throw new IllegalArgumentException("휴대폰 인증이 필요합니다.");
        }
    }

    public void deleteVerified(String phoneNumber) {
        redisTemplate.delete(VERIFIED_KEY_PREFIX + PhoneNumberUtils.normalize(phoneNumber));
    }

    private void validateSendRateLimit(String phoneNumber) {
        String cooldownKey = SEND_COOLDOWN_KEY_PREFIX + phoneNumber;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            throw new IllegalArgumentException("인증번호는 1분 후에 다시 요청해주세요.");
        }

        String countKey = SEND_COUNT_KEY_PREFIX + phoneNumber;
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

    private void rollbackSendState(String phoneNumber) {
        String countKey = SEND_COUNT_KEY_PREFIX + phoneNumber;
        String cooldownKey = SEND_COOLDOWN_KEY_PREFIX + phoneNumber;
        String codeKey = CODE_KEY_PREFIX + phoneNumber;

        redisTemplate.delete(codeKey);
        redisTemplate.delete(cooldownKey);

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
