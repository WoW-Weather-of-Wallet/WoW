package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wow.domain.calendar.entity.FixedExpense;
import com.wow.domain.calendar.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Getter
@AllArgsConstructor
public class FixedExpenseResponse {

    private int totalAmount;
    private List<FixedExpenseItem> items;

    @Getter
    @AllArgsConstructor
    public static class FixedExpenseItem {

        private String name;
        private int amount;
        private int dueDay;          // 원래 결제일
        private int actualDueDay;    // 주말 보정된 실제 결제일
        private String paymentStatus;

        @JsonProperty("isAuto")
        private boolean auto;

        public static FixedExpenseItem of(
                FixedExpense entity,
                int year, int month,
                TransactionRepository transactionRepository) {

            // 1) 원래 결제일
            int dueDay = entity.getDueDay();

            // 2) 주말이면 다음 평일로 이월
            LocalDate dueDate = adjustToWeekday(year, month, dueDay);
            int actualDueDay = dueDate.getDayOfMonth();

            // 3) 해당 월 거래내역에서 납부완료 여부 확인
            LocalDateTime monthStart = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime monthEnd = LocalDateTime.of(
                    year, month,
                    YearMonth.of(year, month).lengthOfMonth(),
                    23, 59, 59);

            boolean isPaid = transactionRepository
                    .existsByUser_IdAndMerchantNameAndTransactionAtBetween(
                            entity.getUser().getId(),
                            entity.getName(),
                            monthStart,
                            monthEnd);

            // 4) paymentStatus 계산
            String paymentStatus;
            if (isPaid) {
                paymentStatus = "납부완료";
            } else {
                LocalDate today = LocalDate.now();
                if (!today.isBefore(dueDate)) {
                    paymentStatus = "납부완료";
                } else {
                    long daysLeft = ChronoUnit.DAYS.between(today, dueDate);
                    paymentStatus = "D-" + daysLeft;
                }
            }

            return new FixedExpenseItem(
                    entity.getName(),
                    entity.getAmount().intValue(),
                    dueDay,
                    actualDueDay,
                    paymentStatus,
                    entity.getIsAuto()
            );
        }

        // 주말이면 다음 평일(월요일)로 이월
        private static LocalDate adjustToWeekday(int year, int month, int dueDay) {
            // 해당 월의 마지막 날 초과 방지
            int lastDay = YearMonth.of(year, month).lengthOfMonth();
            int safeDueDay = Math.min(dueDay, lastDay);

            LocalDate date = LocalDate.of(year, month, safeDueDay);

            // 토요일이면 +2일(월요일), 일요일이면 +1일(월요일)
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY) {
                date = date.plusDays(2);
            } else if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                date = date.plusDays(1);
            }

            return date;
        }
    }
}