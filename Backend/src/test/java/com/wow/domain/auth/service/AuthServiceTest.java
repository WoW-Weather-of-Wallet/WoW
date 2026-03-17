package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.FindPwRequest;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
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
    private CustomUserDetailsService customUserDetailsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void findIdUsesGenderAndNormalizedPhoneNumber() {
        /*
         * 회귀 방지 목적:
         * - findId가 name/gender/birthDate/phoneNumber 조합으로 조회하는지 확인합니다.
         * - 전화번호는 하이픈이 있어도 정규화된 값으로 SMS 검증과 조회가 이뤄져야 합니다.
         */
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "홍길동");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");

        User user = User.builder()
                .userId("wowuser")
                .name("홍길동")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.User)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "홍길동", "M", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));

        FindIdResponse response = authService.findId(request);

        assertThat(response.getUserId()).isEqualTo("wowuser");
        verify(userRepository).findByNameAndGenderAndBirthDateAndPhoneNumber(
                "홍길동", "M", LocalDate.of(1999, 1, 1), "01012345678");
        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
    }

    @Test
    void findIdThrowsSsafyMessageWhenMatchedUserIsSsafyAccount() {
        /*
         * 회귀 방지 목적:
         * - 본인 확인 정보가 모두 일치했을 때 SSAFY 계정 안내 메시지 정책이 유지되는지 확인합니다.
         */
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "김싸피");
        ReflectionTestUtils.setField(request, "gender", "F");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(2000, 2, 2));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-0000-1111");

        User ssafyUser = User.builder()
                .ssafyOauthId("ssafy-123")
                .name("김싸피")
                .gender("F")
                .birthDate(LocalDate.of(2000, 2, 2))
                .phoneNumber("01000001111")
                .role(Role.User)
                .build();

        when(userRepository.findByNameAndGenderAndBirthDateAndPhoneNumber(
                "김싸피", "F", LocalDate.of(2000, 2, 2), "01000001111"))
                .thenReturn(Optional.of(ssafyUser));

        assertThatThrownBy(() -> authService.findId(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("SSAFY 계정으로 가입된 회원입니다.");

        verify(smsService, never()).checkVerified(anyString());
        verify(smsService, never()).deleteVerified(anyString());
    }

    @Test
    void findPasswordUsesNormalizedPhoneNumberAndUpdatesEncodedPassword() {
        /*
         * 회귀 방지 목적:
         * - findPassword가 정규화된 전화번호로 조회하고, SMS 검증 후 비밀번호를 암호화해 저장하는지 확인합니다.
         */
        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "홍길동");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");
        ReflectionTestUtils.setField(request, "newPw", "Valid1!A");

        User user = User.builder()
                .userId("wowuser")
                .pw("old-password")
                .name("홍길동")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.User)
                .build();

        when(userRepository.findByUserIdAndNameAndBirthDateAndPhoneNumber(
                "wowuser", "홍길동", LocalDate.of(1999, 1, 1), "01012345678"))
                .thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.encode("Valid1!A")).thenReturn("encoded-password");

        authService.findPassword(request);

        assertThat(user.getPw()).isEqualTo("encoded-password");
        verify(userRepository).findByUserIdAndNameAndBirthDateAndPhoneNumber(
                "wowuser", "홍길동", LocalDate.of(1999, 1, 1), "01012345678");
        verify(smsService).checkVerified("01012345678");
        verify(smsService).deleteVerified("01012345678");
        verify(bCryptPasswordEncoder).encode("Valid1!A");
    }
}
