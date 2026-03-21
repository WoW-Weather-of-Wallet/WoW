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
        private int dueDay;
        private int actualDueDay;
        private String paymentStatus;
        private String categoryName;    // ← private으로 선언만

        @JsonProperty("isAuto")
        private boolean isAuto;

        public static FixedExpenseItem of(
                FixedExpense entity,
                int year, int month,
                TransactionRepository transactionRepository) {

            int dueDay = entity.getDueDay();
            LocalDate dueDate = adjustToWeekday(year, month, dueDay);
            int actualDueDay = dueDate.getDayOfMonth();

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

            // categoryName — transaction 통해서 접근
            String categoryName = null;
            if (entity.getTransaction() != null
                    && entity.getTransaction().getCategory() != null) {
                categoryName = entity.getTransaction().getCategory().getCategoryName();
            }

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
                    entity.getAmount(),
                    dueDay,
                    actualDueDay,
                    paymentStatus,
                    categoryName,       // ← 추가
                    entity.getIsAuto()
            );
        }

        private static LocalDate adjustToWeekday(int year, int month, int dueDay) {
            int lastDay = YearMonth.of(year, month).lengthOfMonth();
            int safeDueDay = Math.min(dueDay, lastDay);
            LocalDate date = LocalDate.of(year, month, safeDueDay);

            if (date.getDayOfWeek() == DayOfWeek.SATURDAY) {
                date = date.plusDays(2);
            } else if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                date = date.plusDays(1);
            }
            return date;
        }
    }
}