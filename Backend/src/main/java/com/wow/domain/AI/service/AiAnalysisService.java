package com.wow.domain.AI.service;

import com.wow.domain.AI.dto.AiAnalysisRequest;
import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AiAnalysisService {

    private final RestTemplate aiRestTemplate;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    public AiAnalysisService(
            @Qualifier("aiRestTemplate") RestTemplate aiRestTemplate,
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.aiRestTemplate = aiRestTemplate;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public AiAnalysisResponse getAnalysis(Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // Build the report from the target month plus the previous 2 months.
        // Example: 2026-03 request -> aggregate 2026-01-01 <= tx < 2026-04-01.
        YearMonth baseMonth = YearMonth.of(year, month);
        LocalDateTime start = baseMonth.minusMonths(2).atDay(1).atStartOfDay();
        LocalDateTime end = baseMonth.plusMonths(1).atDay(1).atStartOfDay();

        boolean hasTransaction = transactionRepository
                .existsByUser_IdAndTransactionAtBetween(userId, start, end);

        if (!hasTransaction) {
            throw new NotFoundException("최근 3개월 내 AI 분석에 사용할 거래 내역이 없습니다.");
        }

        List<TransactionRepository.CategoryAmountSummary> summaries =
                transactionRepository.findCategoryAmountSummariesByUserIdAndRange(userId, start, end);

        if (summaries.isEmpty()) {
            throw new NotFoundException("최근 3개월 내 AI 분석에 사용할 거래 내역이 없습니다.");
        }

        // chatbot.py expects `items` shaped as category / amount / count.
        // We keep keepSession=false because the report API only needs a one-shot analysis.
        AiAnalysisRequest body = AiAnalysisRequest.from(summaries, false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AiAnalysisRequest> request = new HttpEntity<>(body, headers);

        ResponseEntity<AiAnalysisResponse> response = aiRestTemplate.exchange(
                aiServerBaseUrl + "/api/analyze",
                HttpMethod.POST,
                request,
                AiAnalysisResponse.class
        );

        if (response.getBody() == null) {
            throw new NotFoundException("AI 리포트 응답을 받지 못했습니다.");
        }

        return response.getBody();
    }
}
