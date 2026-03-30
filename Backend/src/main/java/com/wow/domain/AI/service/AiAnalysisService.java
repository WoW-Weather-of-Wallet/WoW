package com.wow.domain.AI.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.AI.dto.AiAnalysisRequest;
import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@Transactional(readOnly = true)
public class AiAnalysisService {

    private static final Duration AI_REPORT_CACHE_TTL = Duration.ofHours(6);
    private static final AiAnalysisType MONTHLY_ANALYSIS_TYPE = AiAnalysisType.MONTHLY;
    private static final String LEGACY_REPORT_UNREADABLE_MESSAGE =
            "기존 AI 리포트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
    private static final String NO_TRANSACTIONS_MESSAGE =
            "최근 3개월 거래가 없어 AI 리포트를 생성할 수 없습니다.";
    private static final String REPORT_NOT_READY_MESSAGE =
            "이번 달 AI 리포트가 아직 생성되지 않았습니다.";
    private static final String AI_EMPTY_RESPONSE_MESSAGE =
            "AI 리포트 응답이 비어 있습니다. 잠시 후 다시 시도해주세요.";
    private static final String AI_CONNECTION_ERROR_MESSAGE =
            "AI 리포트 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";
    private static final String AI_REQUEST_ERROR_MESSAGE =
            "AI 리포트 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    private final RestTemplate aiRestTemplate;
    private final TransactionRepository transactionRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final AiAnalysisWriteService aiAnalysisWriteService;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    public AiAnalysisService(
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate,
            TransactionRepository transactionRepository,
            AiAnalysisRepository aiAnalysisRepository,
            AiAnalysisWriteService aiAnalysisWriteService,
            UserRepository userRepository,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper
    ) {
        this.aiRestTemplate = aiRestTemplate;
        this.transactionRepository = transactionRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.aiAnalysisWriteService = aiAnalysisWriteService;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    // Calendar read APIs can call this path. We suspend any caller transaction so the
    // generation branch can persist through the dedicated write service.
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public AiAnalysisResponse getAnalysis(Long userId, int year, int month) {
        return getAnalysis(userId, year, month, false);
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public AiAnalysisResponse getAnalysis(Long userId, int year, int month, boolean generateIfAbsent) {
        String cacheKey = buildMonthlyAiReportCacheKey(userId, year, month);
        AiAnalysisResponse cached = readMonthlyAiReportCache(cacheKey);
        if (cached != null) {
            return cached;
        }

        Optional<AiAnalysis> storedAnalysis = aiAnalysisRepository
                .findFirstByUser_IdAndYearAndMonthAndAnalysisTypeOrderByCreatedAtDescIdDesc(
                        userId,
                        year,
                        month,
                        MONTHLY_ANALYSIS_TYPE
                );
        if (storedAnalysis.isPresent()) {
            AiAnalysisResponse storedResponse = readStoredMonthlyAnalysis(storedAnalysis.get());
            if (storedResponse != null) {
                writeMonthlyAiReportCache(cacheKey, storedResponse);
                return storedResponse;
            }

            // This month already has a persisted report record. Fetch-only calls must not
            // trigger a second AI generation just because an old row is not JSON-backed yet.
            if (!generateIfAbsent) {
                throw new InternalServerException(LEGACY_REPORT_UNREADABLE_MESSAGE);
            }
        }

        if (!generateIfAbsent && storedAnalysis.isEmpty()) {
            throw new NotFoundException(REPORT_NOT_READY_MESSAGE);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

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

        AiAnalysisRequest body = AiAnalysisRequest.from(summaries, false);
        AiAnalysisResponse aiReport = requestAiReport(body, userId, year, month);

        aiAnalysisWriteService.persistMonthlyAnalysis(user, year, month, aiReport);
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
            affectedReportMonths.add(transactionMonth);
            affectedReportMonths.add(transactionMonth.plusMonths(1));
            affectedReportMonths.add(transactionMonth.plusMonths(2));
        }

        for (YearMonth affectedMonth : affectedReportMonths) {
            try {
                redisTemplate.delete(buildMonthlyAiReportCacheKey(
                        userId,
                        affectedMonth.getYear(),
                        affectedMonth.getMonthValue()
                ));
            } catch (Exception ignored) {
                // Immutable monthly reports remain in DB; cache eviction failure should not block edits.
            }
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
        } catch (ResourceAccessException exception) {
            log.warn(
                    "AI report server connection failed. userId={}, year={}, month={}, baseUrl={}",
                    userId,
                    year,
                    month,
                    aiServerBaseUrl,
                    exception
            );
            throw new InternalServerException(AI_CONNECTION_ERROR_MESSAGE, exception);
        } catch (RestClientException exception) {
            log.error(
                    "AI report request failed. userId={}, year={}, month={}, baseUrl={}",
                    userId,
                    year,
                    month,
                    aiServerBaseUrl,
                    exception
            );
            throw new InternalServerException(AI_REQUEST_ERROR_MESSAGE, exception);
        }
    }

    private String buildMonthlyAiReportCacheKey(Long userId, int year, int month) {
        return RedisKeys.AI_MONTHLY_REPORT_PREFIX + userId + ":" + year + ":" + month;
    }

    private AiAnalysisResponse readStoredMonthlyAnalysis(AiAnalysis aiAnalysis) {
        String serialized = aiAnalysis.getDescription();
        if (serialized == null || serialized.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(serialized, AiAnalysisResponse.class);
        } catch (Exception ignored) {
            return null;
        }
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

    private String serializeResponse(AiAnalysisResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (IOException exception) {
            throw new InternalServerException(AI_EMPTY_RESPONSE_MESSAGE, exception);
        }
    }

    private void writeMonthlyAiReportCache(String cacheKey, AiAnalysisResponse response) {
        try {
            redisTemplate.opsForValue().set(cacheKey, serializeResponse(response), AI_REPORT_CACHE_TTL);
        } catch (Exception ignored) {
            // Cache write failure should not block the AI report response.
        }
    }
}
