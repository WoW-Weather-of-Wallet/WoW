package com.wow.domain.spendinganalysis.service;

import com.wow.domain.spendinganalysis.dto.SpendingQuarterlyResponse;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpendingAnalysisService {

    private static final String ANALYSIS_TYPE_QUARTERLY = "QUARTERLY";

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;

    public SpendingQuarterlyResponse getQuarterlySpendingAnalysis(Long userId) {
        AiAnalysis aiAnalysis = aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_QUARTERLY
                )
                .orElse(null);

        if (aiAnalysis == null) {
            return SpendingQuarterlyResponse.empty();
        }

        List<AiAnalysisCategoryResult> categoryResults =
                aiAnalysisCategoryResultRepository.findByAiAnalysis_IdOrderByMyRatioDesc(aiAnalysis.getId());

        String summary = buildSummary(categoryResults);
        return SpendingQuarterlyResponse.of(aiAnalysis, categoryResults, summary);
    }

    private String buildSummary(List<AiAnalysisCategoryResult> categoryResults) {
        if (categoryResults.isEmpty()) {
            return "카테고리 분석 데이터가 없어 요약을 제공할 수 없어요.";
        }

        AiAnalysisCategoryResult highestRatioResult = categoryResults.get(0);
        String categoryName = highestRatioResult.getCategory().getCategoryName();
        String percentage = toPercentageText(highestRatioResult.getMyRatio());

        return String.format("%s가 전체의 %s%%로 가장 높은 비중을 차지해요.", categoryName, percentage);
    }

    private String toPercentageText(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return value.stripTrailingZeros().toPlainString();
    }
}
