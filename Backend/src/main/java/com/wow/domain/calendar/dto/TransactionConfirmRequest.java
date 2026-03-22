package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
public class TransactionConfirmRequest {

    private List<TransactionItem> items;

    @Getter
    @NoArgsConstructor
    public static class TransactionItem {
        private String tempId;           // DB 저장 안 함, 프론트 식별용
        private String merchantName;
        private int amount;              // 음수로 들어옴 (-6800)
        private Integer categoryId;      // ExpenseCategory PK

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate transactionDate;
    }
}
