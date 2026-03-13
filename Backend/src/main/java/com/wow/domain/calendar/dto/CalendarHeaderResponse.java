package com.wow.domain.calendar.dto;

import lombok.Builder;

@Builder
public record CalendarHeaderResponse(
        String yearMonth,
        String weatherStatus,
        String weatherIcon,
        String weatherDescription,
        int savedAmount
) {}