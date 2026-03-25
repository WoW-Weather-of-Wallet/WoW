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
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpendingAnalysisService {

    private static final int EARLY_MONTH_DAY = 7;

    private static final AiAnalysisType ANALYSIS_TYPE_HALFYEARLY = AiAnalysisType.HALFYEARLY;
    private static final AiAnalysisType ANALYSIS_TYPE_MONTHLY = AiAnalysisType.MONTHLY;

    private static final String EMPTY_COMPARE_DESCRIPTION = "비교할 소비 데이터가 없어요.";
    private static final String NO_LAST_MONTH_DATA_DESCRIPTION = "지난 달 데이터가 없어 이번 달 소비만 보여드려요.";
    private static final String NO_CURRENT_MONTH_DATA_DESCRIPTION = "이번 달 데이터가 없어 지난 달 소비만 보여드려요.";

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

        Map<Integer, BigDecimal> lastMonthRatiosByCategory = lastMonthCategoryResults.stream()
                .collect(Collectors.toMap(
                        result -> result.getCategory().getId(),
                        result -> normalizeRatio(result.getMyRatio()),
                        (left, right) -> left
                ));

        List<SpendingMonthlyCompareResponse.CategoryData> currentCategories = currentMonthCategoryResults.stream()
                .map(result -> toCurrentCategory(result, lastMonthRatiosByCategory))
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

        String description = buildDescription(
                currentMonthAnalysis,
                lastMonthAnalysis,
                currentMonth.getTotalAmount(),
                lastMonth.getTotalAmount(),
                currentMonthCategoryResults
        );

        return SpendingMonthlyCompareResponse.of(currentMonth, lastMonth, description);
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

    private String buildDescription(
            AiAnalysis currentMonthAnalysis,
            AiAnalysis lastMonthAnalysis,
            int currentTotalAmount,
            int lastTotalAmount,
            List<AiAnalysisCategoryResult> currentMonthCategoryResults
    ) {
        if (currentMonthAnalysis == null && lastMonthAnalysis == null) {
            return EMPTY_COMPARE_DESCRIPTION;
        }

        if (lastMonthAnalysis == null) {
            return NO_LAST_MONTH_DATA_DESCRIPTION;
        }

        if (currentMonthAnalysis == null) {
            return NO_CURRENT_MONTH_DATA_DESCRIPTION;
        }

        int diff = currentTotalAmount - lastTotalAmount;
        String topCategoryName = findTopCategoryName(currentMonthCategoryResults);

        if (diff > 0) {
            return "지난 달보다 " + formatAmount(diff) + "원 더 썼어요. " + topCategoryName + "가 주요 원인이에요.";
        }

        if (diff < 0) {
            return "지난 달보다 " + formatAmount(-diff) + "원 덜 썼어요. " + topCategoryName + " 비중이 가장 높아요.";
        }

        return "지난 달과 같은 금액을 썼어요. " + topCategoryName + " 비중이 가장 높아요.";
    }

    private String findTopCategoryName(List<AiAnalysisCategoryResult> categoryResults) {
        return categoryResults.stream()
                .max(Comparator.comparingInt(this::extractPrice))
                .map(result -> result.getCategory().getCategoryName())
                .orElse("기타");
    }

    private String formatAmount(int amount) {
        return String.format("%,d", amount);
    }

    private SpendingMonthlyCompareResponse.CategoryData toCurrentCategory(
            AiAnalysisCategoryResult categoryResult,
            Map<Integer, BigDecimal> lastMonthRatiosByCategory
    ) {
        int categoryId = categoryResult.getCategory().getId();
        BigDecimal currentRatio = normalizeRatio(categoryResult.getMyRatio());
        BigDecimal lastRatio = lastMonthRatiosByCategory.getOrDefault(categoryId, BigDecimal.ZERO);

        return SpendingMonthlyCompareResponse.CategoryData.current(
                categoryId,
                categoryResult.getCategory().getCategoryName(),
                categoryResult.getCategory().getCategoryIcon(),
                toPercentage(currentRatio),
                calculateTrend(currentRatio, lastRatio)
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

    private SpendingMonthlyCompareResponse.Trend calculateTrend(
            BigDecimal currentRatio,
            BigDecimal lastRatio
    ) {
        int compareResult = currentRatio.compareTo(lastRatio);
        if (compareResult > 0) {
            return SpendingMonthlyCompareResponse.Trend.UP;
        }
        if (compareResult < 0) {
            return SpendingMonthlyCompareResponse.Trend.DOWN;
        }
        return SpendingMonthlyCompareResponse.Trend.SAME;
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
