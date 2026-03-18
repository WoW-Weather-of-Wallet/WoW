package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
import com.wow.domain.auth.dto.TokenRefreshResponse;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.security.CustomUserDetailsService;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
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

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

    @InjectMocks
    private AuthService authService;

    @Test
    void refreshReturnsNewAccessTokenWhenStoredRefreshTokenMatches() {
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "wowuser",
                "pw",
                List.of(new SimpleGrantedAuthority("ROLE_User"))
        );

        when(jwtTokenProvider.validateToken("refresh-token")).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken("refresh-token")).thenReturn("wowuser");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refresh:wowuser")).thenReturn("refresh-token");
        when(customUserDetailsService.loadUserByUsername("wowuser")).thenReturn(userDetails);
        when(jwtTokenProvider.createAccessToken("wowuser", List.of("ROLE_User"))).thenReturn("new-access-token");
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
        when(jwtTokenProvider.validateToken("refresh-token")).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken("refresh-token")).thenReturn("wowuser");
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("refresh:wowuser")).thenReturn("another-token");

        assertThatThrownBy(() -> authService.refresh("refresh-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("refresh token");
    }

    @Test
    void findIdUsesGenderAndNormalizedPhoneNumber() {
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
                .role(Role.User)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "tester", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));

        FindIdResponse response = authService.findId(request);

        assertThat(response.getUserId()).isEqualTo("wowuser");
        verify(userRepository).findByNameAndGenderAndBirthDateAndPhoneNumber(
                "tester", "M", LocalDate.of(1999, 1, 1), "01012345678");
        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
    }

    @Test
    void findIdThrowsSsafyMessageWhenMatchedUserIsSsafyAccount() {
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
                .role(Role.User)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "tester", "F", LocalDate.of(2000, 2, 2), "01000001111"))
                .thenReturn(Optional.of(ssafyUser));

        assertThatThrownBy(() -> authService.findId(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SSAFY");

        verify(smsService, never()).checkVerified(anyString());
        verify(smsService, never()).deleteVerified(anyString());
    }

    @Test
    void findPasswordUsesNormalizedPhoneNumberAndUpdatesEncodedPassword() {
        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
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
                .role(Role.User)
                .build();

        when(userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                "wowuser", "tester", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");

        authService.findPassword(request);

        assertThat(user.getPw()).isEqualTo("encoded-password");
        verify(userRepository).findByUserIdAndNameAndBirthDateAndPhoneNumber(
                "wowuser", "tester", LocalDate.of(1999, 1, 1), "01012345678");
        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
        verify(bCryptPasswordEncoder).encode("Valid1!A");
    }

    @Test
    void signupDeletesVerifiedStateWhenSaveFails() {
        UserCreateRequest request = new UserCreateRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "pw", "Valid1!A");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);

        when(userRepository.existsByUserId("wowuser")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(userRepository.existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678")).thenReturn(false);
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");
        doThrow(new RuntimeException("db failure")).when(userRepository).save(any(User.class));

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("db failure");

        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
        verify(userRepository).existsDuplicate("tester", "M", LocalDate.of(1999, 1, 1), "01012345678");
    }

    @Test
    void findPasswordDeletesVerifiedStateWhenPasswordEncodingFails() {
        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
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
                .role(Role.User)
                .build();

        when(userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                "wowuser", "tester", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenThrow(new RuntimeException("encode failure"));

        assertThatThrownBy(() -> authService.findPassword(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("encode failure");

        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
    }
}
