package com.wow.domain.calendar.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
public class TransactionConfirmDto { // 캘린더 거래내역 불러오는 파트 사용
    private String merchantName;
    private String category;
    private int amount;
    private String transactionDate;
}