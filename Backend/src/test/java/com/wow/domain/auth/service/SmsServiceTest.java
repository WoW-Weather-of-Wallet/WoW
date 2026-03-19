package com.wow.domain.auth.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.test.util.ReflectionTestUtils;

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
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void sendCodeThrowsWhenCooldownExists() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(-1L);

        assertThatThrownBy(() -> smsService.sendCode("010-1234-5678"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("1분");

        verify(messageService, never()).sendOne(any());
    }

    @Test
    void sendCodeThrowsWhenHourlyLimitExceeded() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(-2L);

        assertThatThrownBy(() -> smsService.sendCode("01012345678"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("초과");

        verify(messageService, never()).sendOne(any());
        verify(valueOperations, never()).set(eq("sms:code:01012345678"), anyString(), any(Duration.class));
    }

    @Test
    void sendCodeStoresCooldownAndCodeWhenAllowed() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(1L);

        smsService.sendCode("010-1234-5678");

        verify(redisTemplate).execute(any(DefaultRedisScript.class), anyList(), eq("60"), eq("5"), eq("60"));
        verify(valueOperations).set(eq("sms:code:01012345678"), anyString(), eq(Duration.ofMinutes(5)));
        verify(messageService).sendOne(any());
    }

    @Test
    void sendCodeDoesNotResetHourlyWindowWhenSendCountAlreadyExists() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(2L);

        smsService.sendCode("010-1234-5678");

        verify(redisTemplate).execute(any(DefaultRedisScript.class), anyList(), eq("60"), eq("5"), eq("60"));
        verify(messageService).sendOne(any());
    }

    @Test
    void sendCodeThrowsWhenRateLimitScriptFails() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(null);

        assertThatThrownBy(() -> smsService.sendCode("010-1234-5678"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("실패");

        verify(messageService, never()).sendOne(any());
    }

    @Test
    void sendCodeRollsBackRedisStateWhenMessageSendFails() {
        when(redisTemplate.execute(any(DefaultRedisScript.class), anyList(), anyString(), anyString(), anyString()))
                .thenReturn(1L);
        when(valueOperations.decrement("sms:count:01012345678")).thenReturn(0L);
        doThrow(new RuntimeException("send failed")).when(messageService).sendOne(any());

        assertThatThrownBy(() -> smsService.sendCode("010-1234-5678"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("send failed");

        verify(redisTemplate).delete("sms:cooldown:01012345678");
        verify(redisTemplate).delete("sms:count:01012345678");
        verify(redisTemplate).delete("sms:code:01012345678");
        verify(redisTemplate).delete("sms:verify:count:01012345678");
        verify(valueOperations).decrement("sms:count:01012345678");
    }

    @Test
    void verifyCodeThrowsWhenCodeDoesNotMatch() {
        when(valueOperations.get("sms:code:01012345678")).thenReturn("123456");
        when(valueOperations.increment("sms:verify:count:01012345678")).thenReturn(1L);

        assertThatThrownBy(() -> smsService.verifyCode("010-1234-5678", "654321"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("올바르지");

        verify(redisTemplate).expire("sms:verify:count:01012345678", Duration.ofMinutes(5));
    }

    @Test
    void verifyCodeThrowsWhenCodeIsMissingOrExpired() {
        when(valueOperations.get("sms:code:01012345678")).thenReturn(null);

        assertThatThrownBy(() -> smsService.verifyCode("010-1234-5678", "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("만료");

        verify(valueOperations, never()).increment("sms:verify:count:01012345678");
    }

    @Test
    void verifyCodeThrowsAndDeletesCodeWhenVerifyLimitExceeded() {
        when(valueOperations.get("sms:code:01012345678")).thenReturn("123456");
        when(valueOperations.increment("sms:verify:count:01012345678")).thenReturn(5L);

        assertThatThrownBy(() -> smsService.verifyCode("01012345678", "654321"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("초과");

        verify(redisTemplate).delete("sms:code:01012345678");
        verify(redisTemplate).delete("sms:verify:count:01012345678");
    }

    @Test
    void verifyCodeClearsVerifyCountWhenSucceeded() {
        when(valueOperations.get("sms:code:01012345678")).thenReturn("123456");

        smsService.verifyCode("01012345678", "123456");

        verify(redisTemplate).delete("sms:code:01012345678");
        verify(redisTemplate).delete("sms:verify:count:01012345678");
        verify(valueOperations).set("sms:verified:01012345678", "true", Duration.ofMinutes(30));
    }

    @Test
    void checkVerifiedThrowsWhenPhoneNumberIsNotVerified() {
        when(valueOperations.get("sms:verified:01012345678")).thenReturn(null);

        assertThatThrownBy(() -> smsService.checkVerified("010-1234-5678"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("필요");
    }
}
