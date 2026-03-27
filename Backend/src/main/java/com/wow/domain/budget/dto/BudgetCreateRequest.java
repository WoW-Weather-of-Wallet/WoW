package com.wow.domain.budget.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BudgetCreateRequest {

    @NotNull(message = "예산 금액은 필수입니다.")
    @Positive(message = "예산 금액은 0보다 커야 합니다.")
    private Integer amount;
}
