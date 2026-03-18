package com.wow.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.wow.domain.fcm.entity.FcmToken;
import com.wow.domain.fcm.repository.FcmTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    private final FcmTokenRepository fcmTokenRepository;

    @Autowired(required = false)
    private FirebaseMessaging firebaseMessaging;

    @Transactional
    public void saveOrUpdateToken(String userId, String token, String deviceType) {
        fcmTokenRepository.findByToken(token)
                .ifPresentOrElse(
                        existing -> {},
                        () -> fcmTokenRepository.findByUserIdAndDeviceType(userId, deviceType)
                                .ifPresentOrElse(
                                        existing -> existing.updateToken(token),
                                        () -> fcmTokenRepository.save(FcmToken.builder()
                                                .userId(userId)
                                                .token(token)
                                                .deviceType(deviceType)
                                                .build())
                                )
                );
    }

    @Transactional
    public void deleteTokensByUserId(String userId) {

        fcmTokenRepository.deleteByUserId(userId);
    }

    public void sendToUser(String userId, String title, String body) {
        if (firebaseMessaging == null) {
            log.info("Firebase 미설정 - FCM 전송 건너뜀. userId={}", userId);
            return;
        }

        List<FcmToken> tokens = fcmTokenRepository.findAllByUserId(userId);
        if (tokens.isEmpty()) {
            log.info("FCM 토큰 없음. userId={}", userId);
            return;
        }

        for (FcmToken fcmToken : tokens) {
            sendMessage(fcmToken.getToken(), title, body);
        }
    }

    private void sendMessage(String token, String title, String body) {

        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .build();

        try {
            String response = firebaseMessaging.send(message);
            log.info("FCM 전송 성공: {}", response);
        } catch (FirebaseMessagingException e) {
            log.info("FCM 전송 실패: token={}, error={}", token, e.getMessage());
        }

    }

}
