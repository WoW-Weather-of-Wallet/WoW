package com.wow.domain.calendar.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CalendarMemoRequest {

    @NotNull(message = "memo is required.")
    private String memo;
}
