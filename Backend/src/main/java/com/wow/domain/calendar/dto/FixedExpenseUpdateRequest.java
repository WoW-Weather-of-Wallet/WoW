package com.wow.domain.calendar.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FixedExpenseUpdateRequest {

    private String icon;     // null이면 수정 안 함
    private Integer amount;  // null이면 수정 안 함
    private Integer dueDay;  // null이면 수정 안 함
}