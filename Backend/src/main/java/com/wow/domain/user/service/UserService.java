package com.wow.domain.user.service;

import com.wow.domain.user.dto.OnboardingRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.entity.Job;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.JobRepository;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse onboarding(String ssafyOauthId, OnboardingRequest request) {

        User user = userRepository.findBySsafyOauthId(ssafyOauthId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Job job = jobRepository.findById(30L)
                .orElseThrow(() -> new IllegalArgumentException("직업 정보를 찾을 수 없습니다."));

        user.updateOnboarding(job, request.getGender(), request.getPhoneNumber(), request.getBirthDate(), request.isAlarmEnabled());

        return UserProfileResponse.from(user);
    }

}
