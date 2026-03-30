package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class TransactionConfirmResponse {
    private int savedCount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
}