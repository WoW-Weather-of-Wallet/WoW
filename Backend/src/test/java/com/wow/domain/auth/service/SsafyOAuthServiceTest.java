package com.wow.domain.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wow.domain.auth.dto.UserLoginResponse;
import com.wow.domain.auth.dto.ssafy.SsafyRegisterRequest;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.term.entity.Term;
import com.wow.domain.term.service.TermService;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

@ExtendWith(MockitoExtension.class)
class SsafyOAuthServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private SmsService smsService;

    @Mock
    private UserTermRepository userTermRepository;

    @Mock
    private TermService termService;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private SsafyOAuthService ssafyOAuthService;

    @Test
    void registerSavesUserTermWithCurrentRequiredTerm() {
        SsafyRegisterRequest request = createRegisterRequest();
        Term currentTerm = createCurrentTerm();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com")).thenReturn("tester");
        when(userRepository.existsBySsafyOauthId("ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerm()).thenReturn(currentTerm);
        when(jwtTokenProvider.createAccessToken("ssafy@example.com", List.of("ROLE_USER"))).thenReturn("access-token");
        when(jwtTokenProvider.createRefreshToken("ssafy@example.com")).thenReturn("refresh-token");
        when(jwtTokenProvider.getAccessTokenValidityInSeconds()).thenReturn(1800L);
        when(jwtTokenProvider.getRefreshTokenValidityInSeconds()).thenReturn(1209600L);

        UserLoginResponse response = ssafyOAuthService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(userTermRepository).save(argThat((UserTerm userTerm) ->
                userTerm.getTerm() == currentTerm
                        && userTerm.isAgreed()
                        && userTerm.getUser() != null
        ));
        verify(valueOperations).set("refresh:ssafy@example.com", "refresh-token", Duration.ofSeconds(1209600L));
        verify(redisTemplate).delete(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com");
        verify(smsService).deleteVerified("01012345678");
    }

    @Test
    void registerDeletesVerifiedStateWhenUserSaveFails() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com")).thenReturn("tester");
        when(userRepository.existsBySsafyOauthId("ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerm()).thenReturn(createCurrentTerm());
        doThrow(new RuntimeException("db failure")).when(userRepository).save(any(User.class));

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("db failure");

        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
        verify(userTermRepository, never()).save(any(UserTerm.class));
        verify(redisTemplate, never()).delete(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com");
    }

    @Test
    void registerThrowsWhenRequiredTermIsMissing() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com")).thenReturn("tester");
        when(userRepository.existsBySsafyOauthId("ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerm())
                .thenThrow(new IllegalStateException("현재 유효한 필수 약관이 존재하지 않습니다."));

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(IllegalStateException.class);

        verify(smsService, never()).checkVerified(anyString());
        verify(smsService, never()).deleteVerified(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerStopsBeforeSaveWhenSmsVerificationFails() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com")).thenReturn("tester");
        when(userRepository.existsBySsafyOauthId("ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerm()).thenReturn(createCurrentTerm());
        doThrow(new IllegalArgumentException("sms verification required"))
                .when(smsService).checkVerified("01012345678");

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("sms verification");

        verify(userRepository, never()).save(any(User.class));
        verify(userTermRepository, never()).save(any(UserTerm.class));
        verify(smsService, never()).deleteVerified("01012345678");
    }

    private SsafyRegisterRequest createRegisterRequest() {
        SsafyRegisterRequest request = new SsafyRegisterRequest();
        ReflectionTestUtils.setField(request, "ssafyOauthId", "ssafy@example.com");
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);
        ReflectionTestUtils.setField(request, "alarmEnabled", true);
        return request;
    }

    private Term createCurrentTerm() {
        return Term.builder()
                .id(1L)
                .title("service terms")
                .version("v1")
                .effectiveAt(LocalDate.of(2025, 1, 1))
                .required(true)
                .s3Url("s3://bucket/terms.pdf")
                .build();
    }
}
