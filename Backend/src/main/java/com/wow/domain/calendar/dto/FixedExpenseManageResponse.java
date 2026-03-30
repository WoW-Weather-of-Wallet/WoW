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
public class FixedExpenseManageResponse {

    private int totalAmount;
    private List<FixedExpenseManageItem> items;

    @Getter
    @AllArgsConstructor
    public static class FixedExpenseManageItem {

        private Long id;
        private String icon;
        private String name;
        private int amount;
        private int dueDay;

        @JsonProperty("isAuto")
        private Boolean isAuto;

        @JsonProperty("isEnable")
        private Boolean isEnable;

        private String paymentStatus;
        private String categoryName;

        public static FixedExpenseManageItem of(
                FixedExpense entity,
                int year, int month,
                TransactionRepository transactionRepository) {

            // 주말 → 다음 평일 이월
            LocalDate dueDate = adjustToWeekday(year, month, entity.getDueDay());

            // 거래내역 기반 납부완료 확인
            LocalDateTime monthStart = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime monthEnd = LocalDateTime.of(
                    year, month,
                    YearMonth.of(year, month).lengthOfMonth(), 23, 59, 59);

            boolean isPaid = transactionRepository
                    .existsByUser_IdAndMerchantNameAndTransactionAtBetween(
                            entity.getUser().getId(),
                            entity.getName(),
                            monthStart,
                            monthEnd);

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

            // categoryName — ExpenseCategory가 없으면 null 처리
            String categoryName = null;
            if (entity.getTransaction() != null
                    && entity.getTransaction().getCategory() != null) {
                categoryName = entity.getTransaction().getCategory().getCategoryName();
            }

            return new FixedExpenseManageItem(
                    entity.getId(),
                    entity.getIcon(),
                    entity.getName(),
                    entity.getAmount(),
                    entity.getDueDay(),
                    entity.getIsAuto(),
                    entity.getIsEnable(),
                    paymentStatus,
                    categoryName
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