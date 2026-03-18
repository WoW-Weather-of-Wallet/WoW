package com.wow.domain.fcm.scheduler;

import com.wow.domain.fcm.service.FcmService;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final FcmService fcmService;
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 22 * * *", zone = "Asia/Seoul")
    public void sendDailyExpenseReminder() {

        List<User> users = userRepository.findAllByAlarmEnabledTrue();
        log.info("지출 내역 알림 전송 시작 - 대상 사용자 수: {}", users.size());

        for (User user : users) {
            String userId = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
            fcmService.sendToUser(userId, "10시가 되었어요 💸", "하루를 마무리하며 지출 내역을 업로드해보세요.");
        }

        log.info("지출 내역 알림 전송 완료");

    }

}
