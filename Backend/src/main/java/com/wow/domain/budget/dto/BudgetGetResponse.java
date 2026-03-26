package com.wow.domain.budget.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonPropertyOrder({
        "goalAmount",
        "totalSpent",
        "remainingAmount",
        "usagePercentage",
        "remainingDays",
        "dailyAvailable",
        "savedAmount"
})
public class BudgetGetResponse {
    private int goalAmount;
    private int totalSpent;
    private int remainingAmount;
    private int usagePercentage;
    private int remainingDays;
    private int dailyAvailable;
    private int savedAmount;
}
