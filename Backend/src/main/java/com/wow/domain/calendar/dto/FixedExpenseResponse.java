package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
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
        private String paymentStatus;  // "납부완료" or "D-N"

        @JsonProperty("isAuto")
        private boolean isAuto;

        // paymentStatus 계산
        // 오늘 날짜 기준으로 dueDay와 비교
        public static FixedExpenseItem of(
                com.wow.domain.calendar.entity.FixedExpense entity,
                int year, int month) {

            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate dueDate = java.time.LocalDate.of(year, month, entity.getDueDay());

            String paymentStatus;
            if (!today.isBefore(dueDate)) {
                paymentStatus = "납부완료";
            } else {
                long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
                paymentStatus = "D-" + daysLeft;
            }

            return new FixedExpenseItem(
                    entity.getName(),
                    entity.getAmount().intValue(),
                    entity.getDueDay(),
                    paymentStatus,
                    entity.getIsAuto()
            );
        }
    }
}