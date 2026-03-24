package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class TransactionCustomRequest {

    private List<TransactionCustomItem> items;

    @Getter
    @NoArgsConstructor
    public static class TransactionCustomItem {

        @NotNull(message = "카테고리 ID를 입력해주세요.")
        private Integer categoryId;

        @NotBlank(message = "가맹점명을 입력해주세요.")
        private String merchantName;

        @NotNull(message = "금액을 입력해주세요.")
        private Integer amount;

        @NotNull(message = "거래 날짜를 입력해주세요.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate transactionDate;
    }
}
