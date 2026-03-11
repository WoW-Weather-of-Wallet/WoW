package com.wow.domain.auth.service;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class SmsService {

    private static final long CODE_TTL_MINUTES = 5;
    private static final String VERIFIED_KEY_PREFIX = "sms:verified:";
    private static final String CODE_KEY_PREFIX = "sms:code:";

    private final StringRedisTemplate redisTemplate;
    private final DefaultMessageService messageService;
    private final String sender;

    public SmsService(StringRedisTemplate redisTemplate,
                      @Value("${solapi.api-key}") String apiKey,
                      @Value("${solapi.api-secret}") String apiSecret,
                      @Value("${solapi.sender}") String sender) {
        this.redisTemplate = redisTemplate;
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.solapi.com");
        this.sender = sender;
    }

    public void sendCode(String phoneNumber) {
        String code = generateCode();

        redisTemplate.opsForValue().set(
                CODE_KEY_PREFIX + phoneNumber,
                code,
                Duration.ofMinutes(CODE_TTL_MINUTES)
        );

        Message message = new Message();
        message.setFrom(sender);
        message.setTo(phoneNumber);
        message.setText("[WoW] 인증번호 [" + code + "]를 입력해주세요.");

        messageService.sendOne(new SingleMessageSendingRequest(message));
    }

    public void verifyCode(String phoneNumber, String code) {
        String savedCode = redisTemplate.opsForValue().get(CODE_KEY_PREFIX + phoneNumber);

        if (savedCode == null) {
            throw new IllegalArgumentException("인증번호가 만료되었습니다.");
        }
        if (!savedCode.equals(code)) {
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }

        redisTemplate.delete(CODE_KEY_PREFIX + phoneNumber);

        redisTemplate.opsForValue().set(
                VERIFIED_KEY_PREFIX + phoneNumber,
                "true",
                Duration.ofMinutes(30)
        );
    }

    public void checkVerified(String phoneNumber) {
        String verified = redisTemplate.opsForValue().get(VERIFIED_KEY_PREFIX + phoneNumber);
        if (!"true".equals(verified)) {
            throw new IllegalArgumentException("휴대폰 인증이 필요합니다.");
        }
    }

    public void deleteVerified(String phoneNumber) {
        redisTemplate.delete(VERIFIED_KEY_PREFIX + phoneNumber);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

}
