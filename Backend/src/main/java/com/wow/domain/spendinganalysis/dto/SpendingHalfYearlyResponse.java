package com.wow.domain.spendinganalysis.dto;

import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.SpendingType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SpendingHalfYearlyResponse {

    private static final String EMPTY_SUMMARY = "아직 분기 소비 분석 결과가 없어요.";

    private SpendingTypeInfo spendingType;
    private List<CategoryResult> categoryResults;
    private String description;

    public static SpendingHalfYearlyResponse of(
            AiAnalysis aiAnalysis,
            List<AiAnalysisCategoryResult> categoryResults
    ) {
        SpendingType spendingType = aiAnalysis.getSpendingType();

        SpendingTypeInfo spendingTypeInfo = new SpendingTypeInfo(
                spendingType.getName(),
                spendingType.getIconCode(),
                spendingType.getSummary()
        );

        List<CategoryResult> results = categoryResults.stream()
                .map(CategoryResult::from)
                .toList();

        return new SpendingHalfYearlyResponse(
                spendingTypeInfo,
                results,
                aiAnalysis.getDescription()
        );
    }

    public static SpendingHalfYearlyResponse empty() {
        return new SpendingHalfYearlyResponse(
                new SpendingTypeInfo("분석 전", "", EMPTY_SUMMARY),
                List.of(),
                EMPTY_SUMMARY
        );
    }

    @Getter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class SpendingTypeInfo {
        private String name;
        private String iconCode;
        private String summary;
    }

    @Getter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class CategoryResult {
        private String name;
        private String iconCode;
        private Double percentage;

        public static CategoryResult from(AiAnalysisCategoryResult categoryResult) {
            return new CategoryResult(
                    categoryResult.getCategory().getCategoryName(),
                    categoryResult.getCategory().getCategoryIcon(),
                    categoryResult.getMyRatio() == null ? 0.0 : categoryResult.getMyRatio().doubleValue()
            );
        }
    }
}
