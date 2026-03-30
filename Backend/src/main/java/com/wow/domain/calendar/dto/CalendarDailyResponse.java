package com.wow.domain.calendar.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record CalendarDailyResponse(
        Long calendarId,
        LocalDate date,
        Weather weather,
        Summary summary,
        List<TransactionItem> transactions,
        String memo
) {
    @Builder
    public record Weather(
            String iconCode,
            String weatherName,
            String description,
            Integer isForecast
    ) {}

    @Builder
    public record Summary(
            Integer totalExpense,
            Integer transactionCount
    ) {}

    @Builder
    public record TransactionItem(
            String merchantName,
            String category,
            String categoryIcon,
            Integer amount
    ) {}
}
