package com.wow.domain.user.service;

import com.wow.domain.auth.service.SmsService;
import com.wow.domain.fcm.service.FcmService;
import com.wow.domain.term.entity.Term;
import com.wow.domain.term.repository.TermRepository;
import com.wow.domain.user.dto.NotificationSettingsResponse;
import com.wow.domain.user.dto.TermAgreementItemRequest;
import com.wow.domain.user.dto.TermsAgreeRequest;
import com.wow.domain.user.dto.TermsAgreeResponse;
import com.wow.domain.user.dto.UpdateNotificationSettingsRequest;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UserProfileResponse;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.entity.UserTerm;
import com.wow.domain.user.repository.UserRepository;
import com.wow.domain.user.repository.UserTermRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.NotFoundException;
import com.wow.global.util.PhoneNumberUtils;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserTermRepository userTermRepository;
    private final TermRepository termRepository;
    private final SmsService smsService;
    private final StringRedisTemplate redisTemplate;
    private final FcmService fcmService;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        User user = findUserByIdentifier(userId);
        return UserProfileResponse.from(user);
    }

    @Transactional(readOnly = true)
    public NotificationSettingsResponse getNotificationSettings(String userId) {
        User user = findUserByIdentifier(userId);
        return NotificationSettingsResponse.from(user);
    }

    @Transactional
    public TermsAgreeResponse agreeTerms(String userId, TermsAgreeRequest request) {
        User user = findUserByIdentifier(userId);
        LinkedHashSet<Long> requestedTermIds = new LinkedHashSet<>();

        for (TermAgreementItemRequest agreement : request.getAgreements()) {
            if (!Boolean.TRUE.equals(agreement.getAgreed())) {
                throw new BadRequestException("Only agreed=true is allowed for this endpoint.");
            }
            requestedTermIds.add(agreement.getTermId());
        }

        List<Term> terms = termRepository.findAllById(requestedTermIds);
        LinkedHashMap<Long, Term> termsById = new LinkedHashMap<>();
        for (Term term : terms) {
            termsById.put(term.getId(), term);
        }

        for (Long termId : requestedTermIds) {
            if (!termsById.containsKey(termId)) {
                throw new NotFoundException("Term not found. termId=" + termId);
            }
        }

        int savedCount = 0;
        LocalDateTime agreedAt = LocalDateTime.now();

        for (Long termId : requestedTermIds) {
            Term term = termsById.get(termId);
            if (userTermRepository.existsByUserAndTermAndAgreedTrue(user, term)) {
                continue;
            }

            userTermRepository.save(UserTerm.builder()
                    .user(user)
                    .term(term)
                    .agreed(true)
                    .agreedAt(agreedAt)
                    .build());
            savedCount++;
        }

        return new TermsAgreeResponse(savedCount);
    }

    @Transactional
    public void deleteUser(String identifier) {
        User user = findUserByIdentifier(identifier);

        String phoneNumber = PhoneNumberUtils.normalize(user.getPhoneNumber());
        if (phoneNumber.isBlank()) {
            throw new BadRequestException("등록된 휴대폰 번호가 없어 회원 탈퇴를 진행할 수 없습니다.");
        }

        /*
         * 회원 탈퇴는 SMS 본인 인증 완료 상태를 전제로 처리합니다.
         * 삭제 도중 예외가 발생하면 사용자가 SMS 인증부터 다시 하지 않도록,
         * verified 상태는 트랜잭션 커밋 이후에만 소비합니다.
         */
        smsService.checkVerified(phoneNumber);

        String redisKey = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
        redisTemplate.delete(RedisKeys.REFRESH_TOKEN_PREFIX + redisKey);
        redisTemplate.delete(RedisKeys.LOGIN_ATTEMPT_PREFIX + redisKey);
        redisTemplate.delete(RedisKeys.LOGIN_BLOCK_PREFIX + redisKey);
        fcmService.deleteTokensByUserId(redisKey);

        userRepository.delete(user);
        smsService.consumeVerifiedAfterCommit(phoneNumber);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = findUserByIdentifier(userId);

        if (request.getName() != null && request.getName().isBlank()) {
            throw new BadRequestException("Name must not be blank.");
        }

        user.updateProfile(request.getName(), request.getGender(), request.getBirthDate());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void updatePhone(String userId, UpdatePhoneRequest request) {
        User user = findUserByIdentifier(userId);
        String phoneNumber = PhoneNumberUtils.normalize(request.getPhoneNumber());

        if (phoneNumber.equals(user.getPhoneNumber())) {
            throw new BadRequestException("Phone number is unchanged.");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new DuplicateException("Phone number is already in use.");
        }

        smsService.checkAndConsumeVerified(phoneNumber);
        user.updatePhoneNumber(phoneNumber);
    }

    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(
            String userId,
            UpdateNotificationSettingsRequest request) {
        User user = findUserByIdentifier(userId);
        user.updateAlarmEnabled(request.getAlarmEnabled());
        return NotificationSettingsResponse.from(user);
    }

    private User findUserByIdentifier(String identifier) {
        return userRepository.findByUserId(identifier)
                .or(() -> userRepository.findBySsafyOauthId(identifier))
                .orElseThrow(() -> new NotFoundException("User not found."));
    }
}
