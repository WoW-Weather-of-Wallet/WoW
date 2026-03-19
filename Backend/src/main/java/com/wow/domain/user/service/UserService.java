package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.NotFoundException;
import com.wow.global.util.PhoneNumberUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SmsService smsService;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                // [fix] 수정 전: throw new IllegalArgumentException("존재하지 않는 사용자입니다.") | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        return UserProfileResponse.from(user);
    }

    @Transactional
    public void deleteUser(String identifier) {
        User user = userRepository.findByUserId(identifier)
                .or(() -> userRepository.findBySsafyOauthId(identifier))
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        String redisKey = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
        redisTemplate.delete(RedisKeys.REFRESH_TOKEN_PREFIX + redisKey);
        // [added] 이유: 탈퇴 후 동일 userId 재사용 시 이전 로그인 차단 상태가 남아 신규 가입자가 즉시 차단될 수 있음 → 삭제 시 rate limit 키 함께 정리
        redisTemplate.delete(RedisKeys.LOGIN_ATTEMPT_PREFIX + redisKey);
        redisTemplate.delete(RedisKeys.LOGIN_BLOCK_PREFIX + redisKey);

        userRepository.delete(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        if (request.getName() != null && request.getName().isBlank()) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("이름은 공백만 입력할 수 없습니다.");
        }

        user.updateProfile(request.getName(), request.getGender(), request.getBirthDate());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void updatePhone(String userId, UpdatePhoneRequest request) {
        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 리소스 미발견은 404가 적절
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));

        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (phoneNumber.equals(user.getPhoneNumber())) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 커스텀 예외로 전환
            throw new BadRequestException("현재 전화번호와 동일합니다.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            // [fix] 수정 전: throw new IllegalArgumentException(...) | 이유: 중복은 409 CONFLICT가 적절
            throw new DuplicateException("이미 사용 중인 전화번호입니다.");
        }

        // [fix] 수정 전: smsService.checkVerified() + try/finally { smsService.deleteVerified() } | 이유: 원자적 checkAndConsume으로 레이스 컨디션 방지
        smsService.checkAndConsumeVerified(phoneNumber);
        user.updatePhoneNumber(phoneNumber);
    }
}
