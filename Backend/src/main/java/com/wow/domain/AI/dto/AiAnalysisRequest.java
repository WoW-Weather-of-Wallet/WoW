package com.wow.domain.AI.dto;

import com.wow.domain.calendar.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisRequest {

    private List<Item> items;
    private boolean keepSession;

    public static AiAnalysisRequest from(
            List<TransactionRepository.CategoryAmountSummary> summaries,
            boolean keepSession
    ) {
        return AiAnalysisRequest.builder()
                .items(summaries.stream()
                        .map(Item::from)
                        .toList())
                .keepSession(keepSession)
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String category;
        private Integer amount;
        private Integer count;

        public static Item from(TransactionRepository.CategoryAmountSummary summary) {
            // The AI server only needs category aggregates for the last 3 months.
            // Sending amount/count instead of raw transactions keeps the payload compact.
            return Item.builder()
                    .category(summary.getCategoryName())
                    .amount(summary.getTotalAmount().intValue())
                    .count(summary.getTransactionCount().intValue())
                    .build();
        }
    }
}
