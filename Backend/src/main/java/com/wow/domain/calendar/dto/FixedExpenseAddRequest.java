package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FixedExpenseAddRequest {

    @NotNull(message = "거래내역 ID를 입력해주세요.")
    private Long transactionId;

    @NotNull(message = "매월 납부일을 입력해주세요.")
    private Integer dueDay;

    @JsonProperty("isAuto")
    private Boolean isAuto;
}