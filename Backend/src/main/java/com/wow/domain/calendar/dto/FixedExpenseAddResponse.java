package com.wow.domain.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseAddResponse {
    private Long id;
    private String name;
    private boolean isFixed;  // 거래내역 핀 표시용
}