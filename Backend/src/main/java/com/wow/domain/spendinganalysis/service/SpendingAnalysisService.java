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

        return SpendingHalfYearlyResponse.of(aiAnalysis, categoryResults);
    }

    private Optional<AiAnalysis> findLatestAnalysis(Long userId) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_HALFYEARLY
                );
    }
}
