package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.user.dto.UpdatePhoneRequest;
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
        /*
         * 회귀 방지 목적:
         * - 현재 번호를 하이픈만 다르게 넣어도 같은 번호로 인식해 중복 변경을 막아야 합니다.
         */
        User user = User.builder()
                .userId("wowuser")
                .name("홍길동")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.User)
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
        /*
         * 회귀 방지 목적:
         * - 새 번호 변경 시에는 정규화된 번호로 중복 검사와 SMS 검증이 이뤄져야 합니다.
         */
        User user = User.builder()
                .userId("wowuser")
                .name("홍길동")
                .gender("M")
                .birthDate(LocalDate.of(1999, 1, 1))
                .phoneNumber("01012345678")
                .role(Role.User)
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
}
