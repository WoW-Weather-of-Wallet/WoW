package com.wow.domain.auth.service;

import net.nurigo.sdk.message.service.DefaultMessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SmsServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private DefaultMessageService messageService;

    private SmsService smsService;

    @BeforeEach
    void setUp() {
        smsService = new SmsService(redisTemplate, messageService);
        ReflectionTestUtils.setField(smsService, "sender", "01012345678");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void sendCodeThrowsWhenCooldownExists() {
        /*
         * 회귀 방지 목적:
         * - 같은 번호 재요청 쿨다운이 있을 때 SMS를 다시 보내지 않아야 합니다.
         */
        when(redisTemplate.hasKey("sms:cooldown:01012345678")).thenReturn(true);

        assertThatThrownBy(() -> smsService.sendCode("010-1234-5678"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1분");

        verify(messageService, never()).sendOne(any());
    }

    @Test
    void sendCodeThrowsWhenHourlyLimitExceeded() {
        /*
         * 회귀 방지 목적:
         * - 시간당 발송 제한을 넘기면 SMS 발송을 차단해야 합니다.
         */
        when(redisTemplate.hasKey("sms:cooldown:01012345678")).thenReturn(false);
        when(valueOperations.increment("sms:count:01012345678")).thenReturn(6L);

        assertThatThrownBy(() -> smsService.sendCode("01012345678"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("너무 많");

        verify(messageService, never()).sendOne(any());
    }

    @Test
    void sendCodeStoresCooldownAndCodeWhenAllowed() {
        /*
         * 회귀 방지 목적:
         * - 정상 발송 시 발송 횟수 TTL, 쿨다운 키, 인증번호 저장이 함께 이뤄져야 합니다.
         */
        when(redisTemplate.hasKey("sms:cooldown:01012345678")).thenReturn(false);
        when(valueOperations.increment("sms:count:01012345678")).thenReturn(1L);

        smsService.sendCode("010-1234-5678");

        verify(redisTemplate).expire("sms:count:01012345678", Duration.ofMinutes(60));
        verify(valueOperations).set("sms:cooldown:01012345678", "true", Duration.ofSeconds(60));
        verify(valueOperations).set(anyString(), anyString(), any(Duration.class));
        verify(messageService).sendOne(any());
    }
}
