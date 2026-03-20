package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class FlaskPreprocessDto {

    private String message;
    private List<RecordDto> records;

    @JsonProperty("excluded_rows")
    private List<ExcludedDto> excludedRows;

    @JsonProperty("transaction_count")
    private int transactionCount;

    @JsonProperty("included_amount")
    private int includedAmount;

    @JsonProperty("excluded_amount")
    private int excludedAmount;

    @JsonProperty("total_amount")
    private int totalAmount;

    @Getter
    @NoArgsConstructor
    public static class RecordDto {
        @JsonProperty("card_tpbuz_nm_2")
        private String category;
        private int amt;
        private int cnt;
    }

    @Getter
    @NoArgsConstructor
    public static class ExcludedDto {
        @JsonProperty("merchant_name")
        private String merchantName;
        @JsonProperty("classification_reason")
        private String classificationReason;
        private int amount;
        private int cnt;
    }
}