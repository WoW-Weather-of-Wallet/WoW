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

import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
import com.wow.domain.auth.dto.TokenRefreshResponse;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.security.CustomUserDetailsService;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.term.entity.Term;
import com.wow.domain.term.service.TermService;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserTermRepository userTermRepository;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private SmsService smsService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private CustomUserDetailsService customUserDetailsService;

    @Mock
    private TermService termService;

    @InjectMocks
    private AuthService authService;

    @Test
    void refreshReturnsNewAccessTokenWhenStoredRefreshTokenMatches() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "wowuser",
                "pw",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        // [fix] 수정 전: validateToken + getUserIdFromToken | 이유: parseRefreshToken(Claims 반환)으로 변경됨
        Claims claims = Jwts.claims().subject("wowuser").build();
        when(jwtTokenProvider.parseRefreshToken("refresh-token")).thenReturn(claims);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refresh:wowuser")).thenReturn("refresh-token");
        when(customUserDetailsService.loadUserByUsername("wowuser")).thenReturn(userDetails);
        when(jwtTokenProvider.createAccessToken("wowuser", List.of("ROLE_USER"))).thenReturn("new-access-token");
        when(jwtTokenProvider.createRefreshToken("wowuser")).thenReturn("new-refresh-token");
        when(jwtTokenProvider.getAccessTokenValidityInSeconds()).thenReturn(1800L);
        when(jwtTokenProvider.getRefreshTokenValidityInSeconds()).thenReturn(1209600L);

        TokenRefreshResponse response = authService.refresh("refresh-token");

        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getExpiresIn()).isEqualTo(1800L);
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(response.getRefreshExpiresIn()).isEqualTo(1209600L);
        verify(valueOperations).set("refresh:wowuser", "new-refresh-token", Duration.ofSeconds(1209600L));
    }

    @Test
    void refreshThrowsWhenStoredRefreshTokenDoesNotMatch() {
        Claims claims = Jwts.claims().subject("wowuser").build();
        when(jwtTokenProvider.parseRefreshToken("refresh-token")).thenReturn(claims);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refresh:wowuser")).thenReturn("another-token");

        // [fix] 수정 전: IllegalArgumentException | 이유: refresh 토큰 불일치 시 InvalidTokenException으로 변경됨
        assertThatThrownBy(() -> authService.refresh("refresh-token"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("refresh token");
    }

    @Test
    void refreshThrowsWhenRefreshTokenIsInvalid() {
        when(jwtTokenProvider.parseRefreshToken("refresh-token"))
                .thenThrow(new io.jsonwebtoken.JwtException("invalid refresh token"));

        // [fix] 수정 전: IllegalArgumentException | 이유: 유효하지 않은 refresh 토큰은 InvalidTokenException으로 변경됨
        assertThatThrownBy(() -> authService.refresh("refresh-token"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("refresh token");

        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    void findIdUsesGenderAndNormalizedPhoneNumber() {
        stubPublicRateLimit();

        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", " tester ");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");

        User user = User.builder()
                .userId("wowuser")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "tester", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));

        FindIdResponse response = authService.findId(request);

        assertThat(response.getUserId()).isEqualTo("wowuser");
        // [fix] 수정 전: checkVerified + deleteVerified 개별 호출 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService).checkAndConsumeVerified("01012345678");
    }

    @Test
    void findIdThrowsSsafyMessageWhenMatchedUserIsSsafyAccount() {
        stubPublicRateLimit();

        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "F");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(2000, 2, 2));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-0000-1111");

        User ssafyUser = User.builder()
                .ssafyOauthId("ssafy@example.com")
                .name("tester")
                .gender("F")
                .birthDate(LocalDate.of(2000, 2, 2))
                .phoneNumber("01000001111")
                .role(Role.USER)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "tester", "F", LocalDate.of(2000, 2, 2), "01000001111"))
                .thenReturn(Optional.of(ssafyUser));

        // [fix] 수정 전: IllegalArgumentException | 이유: SSAFY 계정 검출 시 BadRequestException으로 변경됨
        assertThatThrownBy(() -> authService.findId(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SSAFY");

        // [fix] 수정 전: checkVerified + deleteVerified never() 개별 검증 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService, never()).checkAndConsumeVerified(anyString());
    }

    @Test
    void findPasswordUsesNormalizedPhoneNumberAndUpdatesEncodedPassword() {
        stubPublicRateLimit();

        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "newPw", "Valid1!A");

        User user = User.builder()
                .userId("wowuser")
                .pw("old-password")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();

        when(userRepository.findByUserIdAndNameAndGenderAndBirthDateAndPhoneNumber(
                "wowuser", "tester", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");

        authService.findPassword(request);

        assertThat(user.getPw()).isEqualTo("encoded-password");
        // [fix] 수정 전: checkVerified + deleteVerified 개별 호출 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService).checkAndConsumeVerified("01012345678");
    }

    @Test
    void signupDeletesVerifiedStateWhenSaveFails() {
        UserCreateRequest request = createSignupRequest();

        when(userRepository.existsByUserIdOrSsafyOauthId("wowuser", "wowuser")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(createCurrentTerms());
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");
        doThrow(new RuntimeException("db failure")).when(userRepository).save(any(User.class));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("db failure");

        // [fix] 수정 전: checkVerified + deleteVerified 개별 호출 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService).checkAndConsumeVerified("01012345678");
    }

    @Test
    void signupSavesUserTermsWithCurrentRequiredTerms() {
        UserCreateRequest request = createSignupRequest();
        List<Term> currentTerms = createCurrentTerms();

        when(userRepository.existsByUserIdOrSsafyOauthId("wowuser", "wowuser")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(currentTerms);
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");

        authService.signup(request);

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
    }

    @Test
    void signupThrowsWhenRequiredTermIsMissing() {
        UserCreateRequest request = createSignupRequest();

        when(userRepository.existsByUserIdOrSsafyOauthId("wowuser", "wowuser")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms())
                .thenThrow(new IllegalStateException("현재 유효한 필수 약관이 존재하지 않습니다."));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(IllegalStateException.class);

        // [fix] 수정 전: checkVerified + deleteVerified never() 개별 검증 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService, never()).checkAndConsumeVerified(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void signupStopsBeforeSaveWhenSmsVerificationFails() {
        UserCreateRequest request = createSignupRequest();

        when(userRepository.existsByUserIdOrSsafyOauthId("wowuser", "wowuser")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(termService.getCurrentRequiredTerms()).thenReturn(createCurrentTerms());
        // [fix] 수정 전: checkVerified에 doThrow | 이유: checkAndConsumeVerified로 메서드명 변경됨
        doThrow(new BadRequestException("sms verification required"))
                .when(smsService).checkAndConsumeVerified("01012345678");

        // [fix] 수정 전: IllegalArgumentException | 이유: SMS 인증 실패 시 BadRequestException으로 변경됨
        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("sms verification");

        verify(userRepository, never()).save(any(User.class));
        verify(userTermRepository, never()).saveAll(anyList());
    }

    @Test
    void signupThrowsWhenUserIdConflictsWithExistingSsafyOauthId() {
        UserCreateRequest request = createSignupRequest();

        when(userRepository.existsByUserIdOrSsafyOauthId("wowuser", "wowuser")).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(com.wow.global.exception.DuplicateException.class)
                .hasMessageContaining("아이디");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void findPasswordDeletesVerifiedStateWhenPasswordEncodingFails() {
        stubPublicRateLimit();

        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "newPw", "Valid1!A");

        User user = User.builder()
                .userId("wowuser")
                .pw("old-password")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();

        when(userRepository.findByUserIdAndNameAndGenderAndBirthDateAndPhoneNumber(
                "wowuser", "tester", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenThrow(new RuntimeException("encode failure"));

        assertThatThrownBy(() -> authService.findPassword(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("encode failure");

        // [fix] 수정 전: checkVerified + deleteVerified 개별 호출 | 이유: 단일 원자적 호출 checkAndConsumeVerified로 통합됨
        verify(smsService).checkAndConsumeVerified("01012345678");
    }

    @Test
    void findPasswordStopsWhenSmsVerificationFails() {
        stubPublicRateLimit();

        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "newPw", "Valid1!A");

        User user = User.builder()
                .userId("wowuser")
                .pw("old-password")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();

        when(userRepository.findByUserIdAndNameAndGenderAndBirthDateAndPhoneNumber(
                "wowuser", "tester", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        // [fix] 수정 전: checkVerified에 doThrow | 이유: checkAndConsumeVerified로 메서드명 변경됨
        doThrow(new BadRequestException("sms verification required"))
                .when(smsService).checkAndConsumeVerified("01012345678");

        // [fix] 수정 전: IllegalArgumentException | 이유: SMS 인증 실패 시 BadRequestException으로 변경됨
        assertThatThrownBy(() -> authService.findPassword(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("sms verification");

        assertThat(user.getPw()).isEqualTo("old-password");
        verify(bCryptPasswordEncoder, never()).encode(anyString());
    }

    private UserCreateRequest createSignupRequest() {
        UserCreateRequest request = new UserCreateRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "pw", "Valid1!A");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);
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

    private void stubPublicRateLimit() {
        when(redisTemplate.execute(any(), anyList(), anyString(), anyString(), anyString())).thenReturn(1L);
    }
}
