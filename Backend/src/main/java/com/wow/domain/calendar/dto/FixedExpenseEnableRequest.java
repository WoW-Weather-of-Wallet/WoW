package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FixedExpenseEnableRequest {

    @NotNull(message = "활성화 여부를 입력해주세요.")
    @JsonProperty("isEnable")
    private Boolean isEnable;
}