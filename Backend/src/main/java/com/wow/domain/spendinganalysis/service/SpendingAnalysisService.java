package com.wow.domain.spendinganalysis.service;

import com.wow.domain.spendinganalysis.dto.SpendingHalfYearlyResponse;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpendingAnalysisService {

    private static final AiAnalysisType ANALYSIS_TYPE_HALFYEARLY = AiAnalysisType.HALFYEARLY;

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;

    public SpendingHalfYearlyResponse getHalfYearlySpendingAnalysis(Long userId) {
        AiAnalysis aiAnalysis = findLatestAnalysis(userId).orElse(null);

        if (aiAnalysis == null) {
            return SpendingHalfYearlyResponse.empty();
        }

        List<AiAnalysisCategoryResult> categoryResults =
                aiAnalysisCategoryResultRepository.findByAiAnalysis_IdOrderByMyRatioDesc(aiAnalysis.getId());

        String summary = buildSummary(categoryResults);
        return SpendingHalfYearlyResponse.of(aiAnalysis, categoryResults, summary);
    }

    private String buildSummary(List<AiAnalysisCategoryResult> categoryResults) {
        if (categoryResults.isEmpty()) {
            return "카테고리 분석 데이터가 없어 요약을 제공할 수 없어요.";
        }

        AiAnalysisCategoryResult highestRatioResult = categoryResults.get(0);
        String categoryName = highestRatioResult.getCategory().getCategoryName();
        String percentage = toPercentageText(highestRatioResult.getMyRatio());

        return String.format("%s(이)가 전체의 %s%%로 가장 높은 비중을 차지해요.", categoryName, percentage);
    }

    private String toPercentageText(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return value.stripTrailingZeros().toPlainString();
    }

    private Optional<AiAnalysis> findLatestAnalysis(Long userId) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_HALFYEARLY
                );
    }
}
