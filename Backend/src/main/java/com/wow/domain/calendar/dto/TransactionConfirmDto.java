package com.wow.domain.calendar.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TransactionConfirmDto {
    private String merchantName;
    private String category;
    private int amount;
    private String transactionDate;
}