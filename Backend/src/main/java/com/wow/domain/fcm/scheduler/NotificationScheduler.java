package com.wow.domain.fcm.scheduler;

import com.wow.domain.calendar.entity.FixedExpense;
import com.wow.domain.calendar.repository.FixedExpenseRepository;
import com.wow.domain.fcm.service.FcmService;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final FcmService fcmService;
    private final UserRepository userRepository;
    private final FixedExpenseRepository fixedExpenseRepository;

    // 오후 10시 거래내역 업로드 알림
    @Scheduled(cron = "0 0 22 * * *", zone = "Asia/Seoul")
    public void sendDailyExpenseReminder() {

        List<User> users = userRepository.findAllByAlarmEnabledTrue();
        log.info("지출 내역 알림 전송 시작 - 대상 사용자 수: {}", users.size());

        for (User user : users) {
            String userId = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
            fcmService.sendToUser(userId, "10시가 되었어요 💸", "하루를 마무리하며 지출 내역을 업로드해보세요.", "add_record");
        }

        log.info("지출 내역 알림 전송 완료");

    }

    // 고정지출 결제 전날 오후 9시 알림
    @Scheduled(cron = "0 0 21 * * *", zone = "Asia/Seoul")
    public void sendFixedExpenseDayBeforeReminder() {

        // 내일 납부일인 고정지출 조회
        int tomorrow = LocalDate.now().plusDays(1).getDayOfMonth();
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findByDueDayAndIsEnableTrue(tomorrow);
        log.info("고정지출 전날 알림 전송 시작 - 대상 항목 수: {}", fixedExpenses.size());

        for (FixedExpense fe : fixedExpenses) {
            User user = fe.getUser();
            // 알림 설정이 꺼진 사용자는 건너뜀
            if (!user.isAlarmEnabled()) continue;
            String userId = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
            fcmService.sendToUser(userId,
                    "고정지출 결제 예정 알림 💳",
                    "내일 " + fe.getName() + " " + Math.abs(fe.getAmount()) + "원이 결제될 예정이에요.",
                    "calendar_main");
        }

        log.info("고정지출 전날 알림 전송 완료");

    }

    // 고정지출 결제 당일 오전 9시 알림
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void sendFixedExpenseDayOfReminder() {

        // 오늘 납부일인 고정지출 조회
        int today = LocalDate.now().getDayOfMonth();
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findByDueDayAndIsEnableTrue(today);
        log.info("고정지출 당일 알림 전송 시작 - 대상 항목 수: {}", fixedExpenses.size());

        for (FixedExpense fe : fixedExpenses) {
            User user = fe.getUser();
            // 알림 설정이 꺼진 사용자는 건너뜀
            if (!user.isAlarmEnabled()) continue;
            String userId = user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
            fcmService.sendToUser(userId,
                    "고정지출 결제일 알림 💳",
                    "오늘 " + fe.getName() + " " + Math.abs(fe.getAmount()) + "원이 결제될 예정이에요.",
                    "calendar_main");
        }

        log.info("고정지출 당일 알림 전송 완료");

    }

}
