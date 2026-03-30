package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.wow.domain.calendar.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class TransactionCustomResponse {

    private int savedCount;
    private List<TransactionCustomItem> items;

    @Getter
    @AllArgsConstructor
    public static class TransactionCustomItem {
        private Long transactionId;
        private String merchantName;
        private int amount;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate transactionDate;

        private String categoryName;

        public static TransactionCustomItem from(Transaction transaction) {
            return new TransactionCustomItem(
                    transaction.getId(),
                    transaction.getMerchantName(),
                    transaction.getAmount().intValue(),
                    transaction.getTransactionAt().toLocalDate(),
                    transaction.getCategory().getCategoryName()
            );
        }
    }
}