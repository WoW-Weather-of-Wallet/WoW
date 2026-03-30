package com.wow.domain.AI.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.expensecategory.repository.ExpenseCategoryRepository;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.entity.SpendingType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import com.wow.domain.spendinganalysis.repository.SpendingTypeRepository;
import com.wow.domain.user.entity.User;
import com.wow.global.exception.InternalServerException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiAnalysisWriteService {

    private static final AiAnalysisType MONTHLY_ANALYSIS_TYPE = AiAnalysisType.MONTHLY;
    private static final String AI_EMPTY_RESPONSE_MESSAGE =
            "AI 분석 응답을 해석할 수 없습니다. 잠시 후 다시 시도해 주세요.";

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final SpendingTypeRepository spendingTypeRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void persistMonthlyAnalysis(User user, int year, int month, AiAnalysisResponse response) {
        if (response.getCluster() == null || response.getCluster().getId() == null) {
            log.warn("AI analysis response does not contain cluster info. userId={}", user.getId());
            return;
        }

        SpendingType spendingType = spendingTypeRepository.findById(response.getCluster().getId().longValue())
                .orElse(null);
        if (spendingType == null) {
            log.warn(
                    "SpendingType not found for clusterId={}, userId={}",
                    response.getCluster().getId(),
                    user.getId()
            );
            return;
        }

        aiAnalysisRepository.deleteByUser_IdAndYearAndMonthAndAnalysisType(
                user.getId(),
                year,
                month,
                MONTHLY_ANALYSIS_TYPE
        );

        AiAnalysis aiAnalysis = aiAnalysisRepository.save(
                AiAnalysis.builder()
                        .user(user)
                        .spendingType(spendingType)
                        .year(year)
                        .month(month)
                        .analysisType(MONTHLY_ANALYSIS_TYPE)
                        // We reuse the existing TEXT column so the whole monthly report can be
                        // re-shown for the rest of the display month without a schema change.
                        .description(serializeResponse(response))
                        .build()
        );

        if (response.getCategories() == null || response.getCategories().isEmpty()) {
            return;
        }

        List<AiAnalysisCategoryResult> categoryResults = new ArrayList<>();

        for (AiAnalysisResponse.Category category : response.getCategories()) {
            if (category == null || category.getName() == null) {
                continue;
            }

            expenseCategoryRepository.findByCategoryName(category.getName())
                    .ifPresent(expenseCategory -> categoryResults.add(
                            AiAnalysisCategoryResult.builder()
                                    .aiAnalysis(aiAnalysis)
                                    .category(expenseCategory)
                                    .myRatio(toBigDecimal(category.getMyRatio()))
                                    .baseRatio(toBigDecimal(category.getBaseRatio()))
                                    .price(category.getAmount() == null ? 0 : category.getAmount().intValue())
                                    .build()
                    ));
        }

        if (!categoryResults.isEmpty()) {
            aiAnalysisCategoryResultRepository.saveAll(categoryResults);
        }
    }

    private BigDecimal toBigDecimal(Double value) {
        return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value);
    }

    private String serializeResponse(AiAnalysisResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (IOException exception) {
            throw new InternalServerException(AI_EMPTY_RESPONSE_MESSAGE, exception);
        }
    }
}
