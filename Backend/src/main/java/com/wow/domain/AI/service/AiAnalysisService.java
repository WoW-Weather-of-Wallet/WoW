package com.wow.domain.AI.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.AI.dto.AiAnalysisRequest;
import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.repository.ExpenseCategoryRepository;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.entity.SpendingType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import com.wow.domain.spendinganalysis.repository.SpendingTypeRepository;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.exception.InternalServerException;
import com.wow.global.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@Transactional(readOnly = true)
public class AiAnalysisService {

    private static final Duration AI_REPORT_CACHE_TTL = Duration.ofHours(6);
    private static final String NO_TRANSACTIONS_MESSAGE = "최근 3개월 거래가 없어 AI 리포트를 생성할 수 없습니다.";
    private static final String AI_EMPTY_RESPONSE_MESSAGE = "AI 리포트 응답이 비어 있습니다. 잠시 후 다시 시도해주세요.";
    private static final String AI_CONNECTION_ERROR_MESSAGE = "AI 리포트 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";
    private static final String AI_REQUEST_ERROR_MESSAGE = "AI 리포트 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    private final RestTemplate aiRestTemplate;
    private final TransactionRepository transactionRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final SpendingTypeRepository spendingTypeRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    public AiAnalysisService(
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate,
            TransactionRepository transactionRepository,
            ExpenseCategoryRepository expenseCategoryRepository,
            SpendingTypeRepository spendingTypeRepository,
            AiAnalysisRepository aiAnalysisRepository,
            AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository,
            UserRepository userRepository,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper
    ) {
        this.aiRestTemplate = aiRestTemplate;
        this.transactionRepository = transactionRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.spendingTypeRepository = spendingTypeRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiAnalysisCategoryResultRepository = aiAnalysisCategoryResultRepository;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AiAnalysisResponse getAnalysis(Long userId, int year, int month) {
        String cacheKey = buildMonthlyAiReportCacheKey(userId, year, month);
        AiAnalysisResponse cached = readMonthlyAiReportCache(cacheKey);
        if (cached != null) {
            return cached;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 기준 월을 포함한 최근 3개월 거래를 AI 리포트 입력으로 사용한다.
        // 예: 2026-03 요청 -> 2026-01-01 <= transactionAt < 2026-04-01
        YearMonth baseMonth = YearMonth.of(year, month);
        LocalDateTime start = baseMonth.minusMonths(2).atDay(1).atStartOfDay();
        LocalDateTime end = baseMonth.plusMonths(1).atDay(1).atStartOfDay();

        boolean hasTransaction = transactionRepository
                .existsByUser_IdAndTransactionAtBetween(userId, start, end);

        if (!hasTransaction) {
            throw new NotFoundException(NO_TRANSACTIONS_MESSAGE);
        }

        List<TransactionRepository.CategoryAmountSummary> summaries =
                transactionRepository.findCategoryAmountSummariesByUserIdAndRange(userId, start, end);

        if (summaries.isEmpty()) {
            throw new NotFoundException(NO_TRANSACTIONS_MESSAGE);
        }

        // AI 서버에는 카테고리별 금액/건수만 보낸다.
        AiAnalysisRequest body = AiAnalysisRequest.from(summaries, false);
        AiAnalysisResponse aiReport = requestAiReport(body, userId, year, month);

        // 운영 정책:
        // 1) 프론트에 필요한 전체 리포트 JSON은 Redis 캐시에 저장한다.
        // 2) DB에는 현재 스키마에 맞는 최소 월별 스냅샷만 저장한다.
        persistMonthlyAnalysis(user, year, month, aiReport);
        writeMonthlyAiReportCache(cacheKey, aiReport);
        return aiReport;
    }

    @Transactional
    public void evictMonthlyAiReportCaches(Long userId, Collection<LocalDate> transactionDates) {
        if (transactionDates == null || transactionDates.isEmpty()) {
            return;
        }

        Set<YearMonth> affectedReportMonths = new LinkedHashSet<>();

        for (LocalDate transactionDate : transactionDates) {
            if (transactionDate == null) {
                continue;
            }

            YearMonth transactionMonth = YearMonth.from(transactionDate);

            // 3개월 롤링 집계이므로 특정 월 거래가 바뀌면
            // 해당 월, 다음 달, 다다음 달 리포트까지 함께 stale 된다.
            affectedReportMonths.add(transactionMonth);
            affectedReportMonths.add(transactionMonth.plusMonths(1));
            affectedReportMonths.add(transactionMonth.plusMonths(2));
        }

        for (YearMonth affectedMonth : affectedReportMonths) {
            aiAnalysisRepository.deleteByUser_IdAndYearAndMonthAndAnalysisType(
                    userId,
                    affectedMonth.getYear(),
                    affectedMonth.getMonthValue(),
                    AiAnalysisType.MONTHLY
            );

            try {
                redisTemplate.delete(buildMonthlyAiReportCacheKey(
                        userId,
                        affectedMonth.getYear(),
                        affectedMonth.getMonthValue()
                ));
            } catch (Exception ignored) {
                // Redis 캐시 삭제 실패가 거래 반영 자체를 막으면 안 된다.
            }
        }
    }

    private void persistMonthlyAnalysis(User user, int year, int month, AiAnalysisResponse response) {
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
                AiAnalysisType.MONTHLY
        );

        AiAnalysis aiAnalysis = aiAnalysisRepository.save(
                AiAnalysis.builder()
                        .user(user)
                        .spendingType(spendingType)
                        .year(year)
                        .month(month)
                        .analysisType(AiAnalysisType.MONTHLY)
                        .description(response.getCluster().getDescription())
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

    private AiAnalysisResponse requestAiReport(AiAnalysisRequest body, Long userId, int year, int month) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AiAnalysisRequest> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<AiAnalysisResponse> response = aiRestTemplate.exchange(
                    aiServerBaseUrl + "/api/analyze",
                    HttpMethod.POST,
                    request,
                    AiAnalysisResponse.class
            );

            if (response.getBody() == null) {
                log.error(
                        "AI report response body is empty. userId={}, year={}, month={}",
                        userId,
                        year,
                        month
                );
                throw new InternalServerException(AI_EMPTY_RESPONSE_MESSAGE);
            }

            return response.getBody();
        } catch (ResourceAccessException e) {
            log.warn(
                    "AI report server connection failed. userId={}, year={}, month={}, baseUrl={}",
                    userId,
                    year,
                    month,
                    aiServerBaseUrl,
                    e
            );
            throw new InternalServerException(AI_CONNECTION_ERROR_MESSAGE, e);
        } catch (RestClientException e) {
            log.error(
                    "AI report request failed. userId={}, year={}, month={}, baseUrl={}",
                    userId,
                    year,
                    month,
                    aiServerBaseUrl,
                    e
            );
            throw new InternalServerException(AI_REQUEST_ERROR_MESSAGE, e);
        }
    }

    private BigDecimal toBigDecimal(Double value) {
        return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value);
    }

    private String buildMonthlyAiReportCacheKey(Long userId, int year, int month) {
        return RedisKeys.AI_MONTHLY_REPORT_PREFIX + userId + ":" + year + ":" + month;
    }

    private AiAnalysisResponse readMonthlyAiReportCache(String cacheKey) {
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached == null || cached.isBlank()) {
                return null;
            }
            return objectMapper.readValue(cached, AiAnalysisResponse.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private void writeMonthlyAiReportCache(String cacheKey, AiAnalysisResponse response) {
        try {
            String serialized = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(cacheKey, serialized, AI_REPORT_CACHE_TTL);
        } catch (IOException ignored) {
            // 캐시 저장 실패가 사용자 리포트 응답을 막으면 안 된다.
        }
    }
}
