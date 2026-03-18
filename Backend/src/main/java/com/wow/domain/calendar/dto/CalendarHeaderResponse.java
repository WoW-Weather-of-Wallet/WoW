package com.wow.domain.calendar.dto;

import lombok.Builder;

@Builder
public record CalendarHeaderResponse(
        String yearMonth,
        String weatherName,
        String iconCode,
        String desc,
        int savedAmount
) {}