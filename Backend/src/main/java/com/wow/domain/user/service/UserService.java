package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserTermRepository userTermRepository;
    private final SmsService smsService;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {

        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return UserProfileResponse.from(user);

    }

    @Transactional
    public void deleteUser(String identifier) {

        User user = userRepository.findByUserId(identifier)
                .or(() -> userRepository.findBySsafyOauthId(identifier))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 회원 동의 이력 삭제
        userTermRepository.deleteByUser(user);

        // Redis refresh token 삭제
        String redisKey = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
        redisTemplate.delete(RedisKeys.REFRESH_TOKEN_PREFIX + redisKey);

        // 유저 삭제
        userRepository.delete(user);

    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {

        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        /*
         * 수정 이유:
         * - DTO 검증이 있더라도 서비스에서 한 번 더 막아두면 다른 진입 경로나 future refactor에서도 안전합니다.
         *
         * 수정 전 코드:
         * - user.updateProfile(request.getName(), request.getGender(), request.getBirthDate());
         */
        if (request.getName() != null && request.getName().isBlank()) {
            throw new IllegalArgumentException("이름은 공백만 입력할 수 없습니다.");
        }

        user.updateProfile(request.getName(), request.getGender(), request.getBirthDate());

        return UserProfileResponse.from(user);

    }

    @Transactional
    public void updatePhone(String userId, UpdatePhoneRequest request) {

        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (phoneNumber.equals(user.getPhoneNumber())) {
            throw new IllegalArgumentException("현재 전화번호와 동일합니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
        }

        /*
         * 수정 이유:
         * - 전화번호 변경 중 예외가 발생해도 인증 완료 상태가 남아 있으면 같은 인증을 재사용할 수 있습니다.
         * - 인증 확인 후에는 finally 에서 상태를 지워 실패 케이스까지 일회성으로 소비되도록 변경합니다.
         *
         * 수정 전 코드:
         * - smsService.checkVerified(phoneNumber);
         * - user.updatePhoneNumber(phoneNumber);
         * - smsService.deleteVerified(phoneNumber);
         */
        smsService.checkVerified(phoneNumber);
        try {
            user.updatePhoneNumber(phoneNumber);
        } finally {
            smsService.deleteVerified(phoneNumber);
        }

    }

}
