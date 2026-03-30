package com.wow.domain.calendar.dto;

import com.wow.domain.calendar.entity.DayType;

import java.time.LocalDate;

public record CalendarMonthlyResponse(
        LocalDate date,
        DayType dayType,
        Long dailyTotal,
        String iconCode,
        Integer isForecast
) {}
