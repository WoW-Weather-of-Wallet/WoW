package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.fcm.service.FcmService;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
// [fix] 수정 전: import 없음 | 이유: IllegalArgumentException → BadRequestException 전환에 따라 커스텀 예외 import 필요
import com.wow.global.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SmsService smsService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @InjectMocks
    private UserService userService;

    @Mock
    private FcmService fcmService;

    @Test
    void updatePhoneRejectsCurrentPhoneNumberEvenWhenFormatDiffers() {
        User user = User.builder()
                .userId("wowuser")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();
        UpdatePhoneRequest request = new UpdatePhoneRequest();
        ReflectionTestUtils.setField(request, "phoneNumber", "010-1234-5678");

        when(userRepository.findByUserId("wowuser")).thenReturn(Optional.of(user));

        // [fix] 수정 전: .isInstanceOf(IllegalArgumentException.class) | 이유: BadRequestException으로 전환
        assertThatThrownBy(() -> userService.updatePhone("wowuser", request))
                .isInstanceOf(BadRequestException.class);

        verify(userRepository, never()).existsByPhoneNumber("01012345678");
        // [fix] 수정 전: verify(smsService, never()).checkVerified("01012345678") | 이유: checkAndConsumeVerified로 메서드명 변경
        verify(smsService, never()).checkAndConsumeVerified("01012345678");
    }

    @Test
    void updatePhoneUsesNormalizedPhoneNumberWhenChangingToNewNumber() {
        User user = User.builder()
                .userId("wowuser")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();
        UpdatePhoneRequest request = new UpdatePhoneRequest();
        ReflectionTestUtils.setField(request, "phoneNumber", "010-9999-8888");

        when(userRepository.findByUserId("wowuser")).thenReturn(Optional.of(user));
        when(userRepository.existsByPhoneNumber("01099998888")).thenReturn(false);

        userService.updatePhone("wowuser", request);

        assertThat(user.getPhoneNumber()).isEqualTo("01099998888");
        verify(userRepository).existsByPhoneNumber("01099998888");
        // [fix] 수정 전: verify(smsService).checkVerified("01099998888") + verify(smsService).deleteVerified("01099998888") | 이유: checkAndConsumeVerified 원자적 호출로 대체
        verify(smsService).checkAndConsumeVerified("01099998888");
    }

    @Test
    void updatePhoneFailsWhenUpdateThrows() {
        User user = mock(User.class);
        UpdatePhoneRequest request = new UpdatePhoneRequest();
        ReflectionTestUtils.setField(request, "phoneNumber", "010-9999-8888");

        when(userRepository.findByUserId("wowuser")).thenReturn(Optional.of(user));
        when(user.getPhoneNumber()).thenReturn("01012345678");
        when(userRepository.existsByPhoneNumber("01099998888")).thenReturn(false);
        doThrow(new RuntimeException("update failure")).when(user).updatePhoneNumber("01099998888");

        assertThatThrownBy(() -> userService.updatePhone("wowuser", request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("update failure");

        // [fix] 수정 전: verify(smsService).checkVerified("01099998888") + verify(smsService).deleteVerified("01099998888") | 이유: checkAndConsumeVerified 원자적 호출로 대체
        verify(smsService).checkAndConsumeVerified("01099998888");
    }

    @Test
    void deleteUserDeletesRefreshTokenAndUserOnly() {
        User user = User.builder()
                .userId("wowuser")
                .name("tester")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();

        when(userRepository.findByUserId("wowuser")).thenReturn(Optional.of(user));

        userService.deleteUser("wowuser");

        verify(redisTemplate).delete("refresh:wowuser");
        verify(userRepository).delete(user);
    }

    @Test
    void updateProfileTrimsNameBeforeSaving() {
        User user = User.builder()
                .userId("wowuser")
                .name("old")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.USER)
                .build();
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "name", " tester ");

        when(userRepository.findByUserId("wowuser")).thenReturn(Optional.of(user));

        userService.updateProfile("wowuser", request);

        assertThat(user.getName()).isEqualTo("tester");
    }
}
