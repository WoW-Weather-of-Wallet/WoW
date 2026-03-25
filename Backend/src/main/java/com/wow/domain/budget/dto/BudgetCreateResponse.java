package com.wow.domain.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BudgetCreateResponse {
    private Long id;
    private Integer amount;
    private String budgetDate;
}
