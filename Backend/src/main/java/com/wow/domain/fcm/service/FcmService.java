package com.wow.domain.fcm.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
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
    public void registerToken(String userId, String token, String deviceType) {
        // 토큰이 이미 존재하면 userId 업데이트 (기기 계정 전환 시), 없으면 새로 저장
        fcmTokenRepository.findByToken(token)
                .ifPresentOrElse(
                        existing -> existing.updateUserId(userId),
                        () -> fcmTokenRepository.save(FcmToken.builder()
                                .userId(userId)
                                .token(token)
                                .deviceType(deviceType)
                                .build())
                );
    }

    // 특정 기기 토큰만 삭제 (로그아웃 시 해당 기기에서만 알림 해제)
    @Transactional
    public void deleteToken(String userId, String token) {
        fcmTokenRepository.findByToken(token)
                .filter(fcmToken -> fcmToken.getUserId().equals(userId))
                .ifPresent(fcmTokenRepository::delete);
    }

    // 유저의 모든 토큰 삭제 (회원 탈퇴 등)
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
                // 앱 삭제, 재설치, 장기 미사용 등으로 만료된 토큰 자동 정리
                fcmTokenRepository.deleteByToken(token);
            } else if (e.getMessagingErrorCode() == MessagingErrorCode.QUOTA_EXCEEDED) {
                // Firebase 무료 플랜 한도 초과 - 사용자 규모가 커지면 유료 플랜 전환 필요
                log.error("FCM 전송 실패 - 할당량 초과: {}", e.getMessage());
            } else if (e.getMessagingErrorCode() == MessagingErrorCode.THIRD_PARTY_AUTH_ERROR) {
                // 서비스 계정 키 만료 또는 교체 시 발생 - 즉시 키 갱신 필요
                log.error("FCM 전송 실패 - 인증 오류 (서비스 계정 키 확인 필요): {}", e.getMessage());
            } else {
                log.error("FCM 전송 실패 - 알 수 없는 오류: code={}, message={}", e.getMessagingErrorCode(), e.getMessage());
            }
        }
    }

}
