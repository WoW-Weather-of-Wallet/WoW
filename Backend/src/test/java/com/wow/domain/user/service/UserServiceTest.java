package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
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
    private UserTermRepository userTermRepository;

    @Mock
    private SmsService smsService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @InjectMocks
    private UserService userService;

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

        assertThatThrownBy(() -> userService.updatePhone("wowuser", request))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).existsByPhoneNumber("01012345678");
        verify(smsService, never()).checkVerified("01012345678");
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
        verify(smsService).checkVerified("01099998888");
        verify(smsService).deleteVerified("01099998888");
    }

    @Test
    void updatePhoneDeletesVerifiedStateWhenUpdateFails() {
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

        verify(smsService).checkVerified("01099998888");
        verify(smsService).deleteVerified("01099998888");
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
        verify(userTermRepository, never()).deleteByUser(user);
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
