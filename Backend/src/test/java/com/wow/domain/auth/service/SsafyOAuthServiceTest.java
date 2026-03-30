package com.wow.domain.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
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
// [fix] 수정 전: import 없음 | 이유: IllegalArgumentException → BadRequestException 전환에 따라 커스텀 예외 import 필요
import com.wow.global.exception.BadRequestException;
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
    void registerSavesUserTermsWithCurrentRequiredTerms() {
        SsafyRegisterRequest request = createRegisterRequest();
        List<Term> currentTerms = createCurrentTerms();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        // [fix] 수정 전: key="SSAFY_PENDING_PREFIX + ssafy@example.com", value="tester" | 이유: pendingToken 기반으로 변경, Redis 값은 "ssafyOauthId|name" 파이프 구분자 형식
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid")).thenReturn("ssafy@example.com|tester");
        when(userRepository.existsByUserIdOrSsafyOauthId("ssafy@example.com", "ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(currentTerms);
        when(jwtTokenProvider.createAccessToken("ssafy@example.com", List.of("ROLE_USER"))).thenReturn("access-token");
        when(jwtTokenProvider.createRefreshToken("ssafy@example.com")).thenReturn("refresh-token");
        when(jwtTokenProvider.getAccessTokenValidityInSeconds()).thenReturn(1800L);
        when(jwtTokenProvider.getRefreshTokenValidityInSeconds()).thenReturn(1209600L);

        UserLoginResponse response = ssafyOAuthService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(userTermRepository).saveAll(argThat((List<UserTerm> userTerms) ->
                userTerms.size() == currentTerms.size()
                        && userTerms.stream().allMatch(UserTerm::isAgreed)
                        // Compare by term id so the test does not depend on entity reference equality.
                        && userTerms.stream()
                        .map(userTerm -> userTerm.getTerm().getId())
                        .toList()
                        .containsAll(currentTerms.stream().map(Term::getId).toList())
                        && userTerms.stream().allMatch(userTerm -> userTerm.getUser() != null)
        ));
        verify(valueOperations).set("refresh:ssafy@example.com", "refresh-token", Duration.ofSeconds(1209600L));
        // [fix] 수정 전: RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com" | 이유: pendingToken 기반으로 변경
        verify(redisTemplate).delete(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid");
        // [fix] 수정 전: verify(smsService).deleteVerified("01012345678") | 이유: checkVerified + deleteVerified → checkAndConsumeVerified 원자적 호출로 대체, 별도 deleteVerified 불필요
    }

    @Test
    void registerFailsWhenUserSaveFails() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        // [fix] 수정 전: key="SSAFY_PENDING_PREFIX + ssafy@example.com", value="tester" | 이유: pendingToken 기반으로 변경, Redis 값은 "ssafyOauthId|name" 파이프 구분자 형식
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid")).thenReturn("ssafy@example.com|tester");
        when(userRepository.existsByUserIdOrSsafyOauthId("ssafy@example.com", "ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(createCurrentTerms());
        doThrow(new RuntimeException("db failure")).when(userRepository).save(any(User.class));

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("db failure");

        // [fix] 수정 전: verify(smsService).checkVerified("01012345678") + verify(smsService).deleteVerified("01012345678") | 이유: checkAndConsumeVerified 원자적 호출로 대체
        verify(smsService).checkAndConsumeVerified("01012345678");
        verify(userTermRepository, never()).saveAll(anyList());
        // [fix] 수정 전: RedisKeys.SSAFY_PENDING_PREFIX + "ssafy@example.com" | 이유: pendingToken 기반으로 변경
        verify(redisTemplate, never()).delete(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid");
    }

    @Test
    void registerThrowsWhenRequiredTermIsMissing() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        // [fix] 수정 전: key="SSAFY_PENDING_PREFIX + ssafy@example.com", value="tester" | 이유: pendingToken 기반으로 변경, Redis 값은 "ssafyOauthId|name" 파이프 구분자 형식
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid")).thenReturn("ssafy@example.com|tester");
        when(userRepository.existsByUserIdOrSsafyOauthId("ssafy@example.com", "ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms())
                .thenThrow(new IllegalStateException("현재 유효한 필수 약관이 존재하지 않습니다."));

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(IllegalStateException.class);

        // [fix] 수정 전: verify(smsService, never()).checkVerified(anyString()) | 이유: checkAndConsumeVerified로 메서드명 변경
        verify(smsService, never()).checkAndConsumeVerified(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerStopsBeforeSaveWhenSmsVerificationFails() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        // [fix] 수정 전: key="SSAFY_PENDING_PREFIX + ssafy@example.com", value="tester" | 이유: pendingToken 기반으로 변경, Redis 값은 "ssafyOauthId|name" 파이프 구분자 형식
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid")).thenReturn("ssafy@example.com|tester");
        when(userRepository.existsByUserIdOrSsafyOauthId("ssafy@example.com", "ssafy@example.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(createCurrentTerms());
        // [fix] 수정 전: doThrow(...).when(smsService).checkVerified("01012345678") | 이유: checkAndConsumeVerified로 메서드명 변경, IllegalArgumentException → BadRequestException
        doThrow(new BadRequestException("휴대폰 인증이 필요합니다."))
                .when(smsService).checkAndConsumeVerified("01012345678");

        // [fix] 수정 전: .isInstanceOf(IllegalArgumentException.class) | 이유: BadRequestException으로 전환
        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).save(any(User.class));
        verify(userTermRepository, never()).saveAll(anyList());
    }

    @Test
    void registerThrowsWhenSsafyOauthIdConflictsWithExistingGeneralUserId() {
        SsafyRegisterRequest request = createRegisterRequest();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.SSAFY_PENDING_PREFIX + "pending-token-uuid")).thenReturn("ssafy@example.com|tester");
        when(userRepository.existsByUserIdOrSsafyOauthId("ssafy@example.com", "ssafy@example.com")).thenReturn(true);

        assertThatThrownBy(() -> ssafyOAuthService.register(request))
                .isInstanceOf(com.wow.global.exception.DuplicateException.class)
                .hasMessageContaining("SSAFY");

        verify(userRepository, never()).save(any(User.class));
    }

    private SsafyRegisterRequest createRegisterRequest() {
        SsafyRegisterRequest request = new SsafyRegisterRequest();
        // [fix] 수정 전: ReflectionTestUtils.setField(request, "ssafyOauthId", "ssafy@example.com") | 이유: SsafyRegisterRequest 필드가 ssafyOauthId → pendingToken으로 변경
        ReflectionTestUtils.setField(request, "pendingToken", "pending-token-uuid");
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);
        ReflectionTestUtils.setField(request, "alarmEnabled", true);
        return request;
    }

    private List<Term> createCurrentTerms() {
        return List.of(
                Term.builder()
                        .id(1L)
                        .title("service terms")
                        .version("v1")
                        .effectiveAt(LocalDate.of(2025, 1, 1))
                        .required(true)
                        .s3Url("s3://bucket/service.pdf")
                        .build(),
                Term.builder()
                        .id(2L)
                        .title("privacy terms")
                        .version("v1")
                        .effectiveAt(LocalDate.of(2025, 1, 1))
                        .required(true)
                        .s3Url("s3://bucket/privacy.pdf")
                        .build()
        );
    }
}
