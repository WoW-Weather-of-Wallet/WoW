package com.wow.domain.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseUpdateResponse {
    private Long id;
    private String name;
}