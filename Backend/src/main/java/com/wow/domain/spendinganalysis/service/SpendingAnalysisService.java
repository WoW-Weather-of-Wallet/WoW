package com.wow.domain.spendinganalysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.spendinganalysis.dto.SpendingHalfYearlyResponse;
import com.wow.domain.spendinganalysis.dto.SpendingMonthlyCompareResponse;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import com.wow.global.constant.RedisKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpendingAnalysisService {

    private static final int EARLY_MONTH_DAY = 7;

    private static final AiAnalysisType ANALYSIS_TYPE_HALFYEARLY = AiAnalysisType.HALFYEARLY;

    private static final Duration MONTHLY_COMPARE_CACHE_TTL = Duration.ofMinutes(30);
    private static final DateTimeFormatter CACHE_DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;
    private final TransactionRepository transactionRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

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
        String cacheKey = buildMonthlyCompareCacheKey(userId, today);
        SpendingMonthlyCompareResponse cachedResponse = readMonthlyCompareCache(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse;
        }

        YearMonth currentTargetMonth = isEarlyMonth(today)
                ? YearMonth.from(today.minusMonths(1))
                : YearMonth.from(today);
        YearMonth defaultLastTargetMonth = currentTargetMonth.minusMonths(1);

        MonthAggregate currentMonthAggregate = buildMonthAggregate(
                userId,
                currentTargetMonth,
                true
        );

        MonthAggregate lastMonthAggregate = buildMonthAggregate(
                userId,
                defaultLastTargetMonth,
                false
        );

        SpendingMonthlyCompareResponse response = SpendingMonthlyCompareResponse.of(
                currentMonthAggregate.monthData(),
                lastMonthAggregate.monthData()
        );

        writeMonthlyCompareCache(cacheKey, response);
        return response;
    }

    @Transactional
    public void evictMonthlyCompareCache(Long userId) {
        String cacheKey = buildMonthlyCompareCacheKey(userId, LocalDate.now());
        try {
            redisTemplate.delete(cacheKey);
        } catch (Exception ignored) {
            // Keep business flow even when Redis is temporarily unavailable.
        }
    }

    private MonthAggregate buildMonthAggregate(
            Long userId,
            YearMonth targetMonth,
            boolean currentMonthStyle
    ) {
        List<TransactionRepository.CategoryAmountSummary> categorySummaries =
                findCategoryAmountSummaries(userId, targetMonth);

        if (categorySummaries.isEmpty()) {
            return MonthAggregate.empty(targetMonth);
        }

        int totalAmount = categorySummaries.stream()
                .map(TransactionRepository.CategoryAmountSummary::getTotalAmount)
                .mapToInt(this::toAmount)
                .sum();

        if (totalAmount <= 0) {
            return MonthAggregate.empty(targetMonth);
        }

        List<SpendingMonthlyCompareResponse.CategoryData> categories = categorySummaries.stream()
                .map(summary -> toCategoryData(summary, totalAmount, currentMonthStyle))
                .toList();

        SpendingMonthlyCompareResponse.MonthData monthData = SpendingMonthlyCompareResponse.MonthData.of(
                targetMonth.getYear(),
                targetMonth.getMonthValue(),
                totalAmount,
                categories
        );
        return new MonthAggregate(monthData, true);
    }

    private List<TransactionRepository.CategoryAmountSummary> findCategoryAmountSummaries(
            Long userId,
            YearMonth targetMonth
    ) {
        LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime end = targetMonth.plusMonths(1).atDay(1).atStartOfDay();
        return transactionRepository.findCategoryAmountSummariesByUserIdAndRange(userId, start, end);
    }

    private SpendingMonthlyCompareResponse.CategoryData toCategoryData(
            TransactionRepository.CategoryAmountSummary summary,
            int totalAmount,
            boolean currentMonthStyle
    ) {
        int percentage = calculatePercentage(summary.getTotalAmount(), totalAmount);

        if (currentMonthStyle) {
            return SpendingMonthlyCompareResponse.CategoryData.current(
                    summary.getCategoryId(),
                    summary.getCategoryName(),
                    summary.getCategoryIcon(),
                    percentage
            );
        }

        return SpendingMonthlyCompareResponse.CategoryData.previous(
                summary.getCategoryId(),
                summary.getCategoryName(),
                summary.getCategoryIcon(),
                percentage
        );
    }

    private int calculatePercentage(BigDecimal categoryAmount, int totalAmount) {
        if (totalAmount <= 0) {
            return 0;
        }
        return normalizeAmount(categoryAmount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalAmount), 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private int toAmount(BigDecimal amount) {
        return normalizeAmount(amount).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private Optional<AiAnalysis> findLatestHalfYearlyAnalysis(Long userId) {
        return aiAnalysisRepository
                .findFirstByUser_IdAndAnalysisTypeOrderByYearDescMonthDescCreatedAtDescIdDesc(
                        userId,
                        ANALYSIS_TYPE_HALFYEARLY
                );
    }

    private boolean isEarlyMonth(LocalDate today) {
        return today.getDayOfMonth() <= EARLY_MONTH_DAY;
    }

    private String buildMonthlyCompareCacheKey(Long userId, LocalDate today) {
        return RedisKeys.SPENDING_MONTHLY_COMPARE_PREFIX
                + userId
                + ":"
                + today.format(CACHE_DATE_FORMAT);
    }

    private SpendingMonthlyCompareResponse readMonthlyCompareCache(String cacheKey) {
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached == null || cached.isBlank()) {
                return null;
            }
            return objectMapper.readValue(cached, SpendingMonthlyCompareResponse.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private void writeMonthlyCompareCache(String cacheKey, SpendingMonthlyCompareResponse response) {
        try {
            String serialized = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, serialized, MONTHLY_COMPARE_CACHE_TTL);
        } catch (Exception ignored) {
            // Keep business flow even when Redis is temporarily unavailable.
        }
    }

    private record MonthAggregate(
            SpendingMonthlyCompareResponse.MonthData monthData,
            boolean hasData
    ) {
        private static MonthAggregate empty(YearMonth month) {
            return new MonthAggregate(
                    SpendingMonthlyCompareResponse.MonthData.empty(
                            month.getYear(),
                            month.getMonthValue()
                    ),
                    false
            );
        }
    }
}
