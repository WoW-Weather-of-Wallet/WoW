package com.wow.domain.spendinganalysis.service;

import com.wow.domain.spendinganalysis.dto.SpendingHalfYearlyResponse;
import com.wow.domain.spendinganalysis.dto.SpendingMonthlyCompareResponse;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpendingAnalysisService {

    private static final int EARLY_MONTH_DAY = 7;

    private static final AiAnalysisType ANALYSIS_TYPE_HALFYEARLY = AiAnalysisType.HALFYEARLY;
    private static final AiAnalysisType ANALYSIS_TYPE_MONTHLY = AiAnalysisType.MONTHLY;

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;

    public SpendingHalfYearlyResponse getHalfYearlySpendingAnalysis(Long userId) {
        AiAnalysis aiAnalysis = findLatestHalfYearlyAnalysis(userId).orElse(null);

        if (aiAnalysis == null) {
            return SpendingHalfYearlyResponse.empty();
        }

        List<AiAnalysisCategoryResult> categoryResults =
                aiAnalysisCategoryResultRepository.findByAiAnalysis_IdOrderByMyRatioDesc(aiAnalysis.getId());

        return SpendingHalfYearlyResponse.of(aiAnalysis, categoryResults);
    }

    public SpendingMonthlyCompareResponse getMonthlySpendingCompare(Long userId) {
        LocalDate today = LocalDate.now();

        if (isEarlyMonth(today)) {
            YearMonth currentTargetMonth = YearMonth.from(today.minusMonths(1));
            YearMonth lastTargetMonth = currentTargetMonth.minusMonths(1);

            AiAnalysis currentMonthAnalysis = findLatestMonthlyAnalysis(userId, currentTargetMonth).orElse(null);
            AiAnalysis lastMonthAnalysis = findLatestMonthlyAnalysis(userId, lastTargetMonth).orElse(null);

            return buildMonthlyCompareResponse(
                    currentMonthAnalysis,
                    currentTargetMonth,
                    lastMonthAnalysis,
                    lastTargetMonth
            );
        }

        AiAnalysis currentMonthAnalysis = findLatestMonthlyAnalysis(userId).orElse(null);

        if (currentMonthAnalysis == null) {
            YearMonth currentTargetMonth = YearMonth.from(today);
            YearMonth lastTargetMonth = currentTargetMonth.minusMonths(1);
            return SpendingMonthlyCompareResponse.empty(
                    SpendingMonthlyCompareResponse.MonthData.empty(
                            currentTargetMonth.getYear(),
                            currentTargetMonth.getMonthValue()
                    ),
                    SpendingMonthlyCompareResponse.MonthData.empty(
                            lastTargetMonth.getYear(),
                            lastTargetMonth.getMonthValue()
                    )
            );
        }

        YearMonth currentTargetMonth = YearMonth.of(
                currentMonthAnalysis.getYear(),
                currentMonthAnalysis.getMonth()
        );

        LocalDate previousReferenceDate = resolveReferenceDate(currentMonthAnalysis, currentTargetMonth).minusMonths(1);
        YearMonth lastTargetMonth = YearMonth.from(previousReferenceDate);

        AiAnalysis lastMonthAnalysis = findMonthlyAnalysisByDate(userId, previousReferenceDate)
                .or(() -> findLatestMonthlyAnalysis(userId, lastTargetMonth))
                .orElse(null);

        return buildMonthlyCompareResponse(
                currentMonthAnalysis,
                currentTargetMonth,
                lastMonthAnalysis,
                lastTargetMonth
        );
    }

    private SpendingMonthlyCompareResponse buildMonthlyCompareResponse(
            AiAnalysis currentMonthAnalysis,
            YearMonth currentTargetMonth,
            AiAnalysis lastMonthAnalysis,
            YearMonth lastTargetMonth
    ) {
        List<AiAnalysisCategoryResult> currentMonthCategoryResults = findCategoryResults(currentMonthAnalysis);
        List<AiAnalysisCategoryResult> lastMonthCategoryResults = findCategoryResults(lastMonthAnalysis);

        List<SpendingMonthlyCompareResponse.CategoryData> currentCategories = currentMonthCategoryResults.stream()
                .map(this::toCurrentCategory)
                .toList();

        List<SpendingMonthlyCompareResponse.CategoryData> lastCategories = lastMonthCategoryResults.stream()
                .map(this::toLastCategory)
                .toList();

        SpendingMonthlyCompareResponse.MonthData currentMonth = buildMonthData(
                currentMonthAnalysis,
                currentTargetMonth,
                currentCategories,
                currentMonthCategoryResults
        );

        SpendingMonthlyCompareResponse.MonthData lastMonth = buildMonthData(
                lastMonthAnalysis,
                lastTargetMonth,
                lastCategories,
                lastMonthCategoryResults
        );

        if (currentMonthAnalysis == null && lastMonthAnalysis == null) {
            return SpendingMonthlyCompareResponse.empty(currentMonth, lastMonth);
        }

        return SpendingMonthlyCompareResponse.of(currentMonth, lastMonth);
    }

    private SpendingMonthlyCompareResponse.MonthData buildMonthData(
            AiAnalysis analysis,
            YearMonth targetMonth,
            List<SpendingMonthlyCompareResponse.CategoryData> categories,
            List<AiAnalysisCategoryResult> categoryResults
    ) {
        if (analysis == null) {
            return SpendingMonthlyCompareResponse.MonthData.empty(
                    targetMonth.getYear(),
                    targetMonth.getMonthValue()
            );
        }

        return SpendingMonthlyCompareResponse.MonthData.of(
                analysis.getYear(),
                analysis.getMonth(),
                calculateTotalAmount(categoryResults),
                categories
        );
    }

    private SpendingMonthlyCompareResponse.CategoryData toCurrentCategory(
            AiAnalysisCategoryResult categoryResult
    ) {
        BigDecimal currentRatio = normalizeRatio(categoryResult.getMyRatio());
        return SpendingMonthlyCompareResponse.CategoryData.current(
                categoryResult.getCategory().getId(),
                categoryResult.getCategory().getCategoryName(),
                categoryResult.getCategory().getCategoryIcon(),
                toPercentage(currentRatio)
        );
    }

    private SpendingMonthlyCompareResponse.CategoryData toLastCategory(
            AiAnalysisCategoryResult categoryResult
    ) {
        return SpendingMonthlyCompareResponse.CategoryData.previous(
                categoryResult.getCategory().getId(),
                categoryResult.getCategory().getCategoryName(),
                categoryResult.getCategory().getCategoryIcon(),
                toPercentage(normalizeRatio(categoryResult.getMyRatio()))
        );
    }

    private int toPercentage(BigDecimal ratio) {
        return ratio.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private int calculateTotalAmount(List<AiAnalysisCategoryResult> categoryResults) {
        return categoryResults.stream()
                .mapToInt(this::extractPrice)
                .sum();
    }

    private int extractPrice(AiAnalysisCategoryResult categoryResult) {
        return categoryResult.getPrice() == null ? 0 : categoryResult.getPrice();
    }

    private BigDecimal normalizeRatio(BigDecimal ratio) {
        return ratio == null ? BigDecimal.ZERO : ratio;
    }

    private List<AiAnalysisCategoryResult> findCategoryResults(AiAnalysis aiAnalysis) {
        if (aiAnalysis == null) {
            return List.of();
        }

        return aiAnalysisCategoryResultRepository.findByAiAnalysis_IdOrderByMyRatioDesc(aiAnalysis.getId());
    }

    private boolean isEarlyMonth(LocalDate today) {
        return today.getDayOfMonth() <= EARLY_MONTH_DAY;
    }

    private LocalDate resolveReferenceDate(AiAnalysis aiAnalysis, YearMonth fallbackMonth) {
        LocalDateTime createdAt = aiAnalysis.getCreatedAt();
        if (createdAt != null) {
            return createdAt.toLocalDate();
        }
        return fallbackMonth.atDay(1);
    }

    private Optional<AiAnalysis> findLatestHalfYearlyAnalysis(Long userId) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_HALFYEARLY
                );
    }

    private Optional<AiAnalysis> findLatestMonthlyAnalysis(Long userId) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_MONTHLY
                );
    }

    private Optional<AiAnalysis> findLatestMonthlyAnalysis(Long userId, YearMonth targetMonth) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeAndYearAndMonthOrderByCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_MONTHLY,
                        targetMonth.getYear(),
                        targetMonth.getMonthValue()
                );
    }

    private Optional<AiAnalysis> findMonthlyAnalysisByDate(Long userId, LocalDate targetDate) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeAndCreatedAtBetweenOrderByCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_MONTHLY,
                        targetDate.atStartOfDay(),
                        targetDate.atTime(LocalTime.MAX)
                );
    }
}
