package com.wow.domain.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CalendarTransactionResponse {

    private String yearMonth;
    private int totalAmount;
    private List<DailyItem> items;

    @Getter
    @AllArgsConstructor
    public static class DailyItem {
        private String date;
        private List<TransactionItem> transactions;
    }

    @Getter
    @AllArgsConstructor
    public static class TransactionItem {
        private Long transactionId;
        private String icon;
        private String merchantName;
        private String category;
        private int amount;
        private Boolean isFixed;
        private String paymentType;
    }
}