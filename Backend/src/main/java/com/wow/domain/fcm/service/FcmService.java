package com.wow.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;
import com.wow.domain.fcm.entity.FcmToken;
import com.wow.domain.fcm.repository.FcmTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FcmService {

    private final FcmTokenRepository fcmTokenRepository;

    @Autowired(required = false)
    private FirebaseMessaging firebaseMessaging;

    @Transactional
    public void saveOrUpdateToken(String userId, String token, String deviceType) {
        if (fcmTokenRepository.findByToken(token).isEmpty()) {
            fcmTokenRepository.save(FcmToken.builder()
                    .userId(userId)
                    .token(token)
                    .deviceType(deviceType)
                    .build());
        }
    }

    @Transactional
    public void deleteTokensByUserId(String userId) {
        fcmTokenRepository.deleteByUserId(userId);
    }

    public void sendToUser(String userId, String title, String body) {
        if (firebaseMessaging == null) {
            return;
        }

        List<FcmToken> tokens = fcmTokenRepository.findAllByUserId(userId);
        if (tokens.isEmpty()) {
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
            firebaseMessaging.send(message);
        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                fcmTokenRepository.deleteByToken(token);
            }
        }
    }

}
