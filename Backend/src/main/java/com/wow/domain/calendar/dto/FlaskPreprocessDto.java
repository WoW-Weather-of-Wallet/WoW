package com.wow.domain.calendar.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class FlaskPreprocessDto { // 켈린더 거래내역 불러오는 파트 사용

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
        private String category;   // 카테고리명
        private int amt;           // 금액
        private int cnt;           // 건수
    }

    @Getter
    @NoArgsConstructor
    public static class ExcludedDto {
        @JsonProperty("merchant_name")
        private String merchantName;           // 가맹점명
        @JsonProperty("classification_reason")
        private String classificationReason;   // 미분류 이유
        private int amount;
        private int cnt;
    }
}