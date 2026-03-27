package com.wow.domain.calendar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CalendarMemoResponse {
    private Long calendarId;
    private String memo;
}
