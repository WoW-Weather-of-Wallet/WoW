package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FixedExpenseEnableResponse {
    private Long id;

    @JsonProperty("isEnable")
    private Boolean isEnable;
}