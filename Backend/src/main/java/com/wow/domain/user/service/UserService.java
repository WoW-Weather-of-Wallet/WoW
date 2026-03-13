package com.wow.domain.user.service;

import com.wow.domain.user.dto.OnboardingRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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

        userRepository.delete(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {

        User user = userRepository.findByUserId(userId)
                .or(() -> userRepository.findBySsafyOauthId(userId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        user.updateProfile(request.getName(), request.getGender(), request.getBirthDate());

        return UserProfileResponse.from(user);

    }

    @Transactional
    public UserProfileResponse onboarding(String ssafyOauthId, OnboardingRequest request) {

        User user = userRepository.findBySsafyOauthId(ssafyOauthId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (user.getPhoneNumber() != null) {
            throw new IllegalArgumentException("이미 온보딩이 완료된 사용자입니다.");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("이미 가입된 전화번호입니다.");
        }

        user.updateOnboarding(request.getGender(), request.getPhoneNumber(), request.getBirthDate(), request.isAlarmEnabled());

        return UserProfileResponse.from(user);

    }

}
