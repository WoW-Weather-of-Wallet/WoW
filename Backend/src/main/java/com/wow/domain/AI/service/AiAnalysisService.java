package com.wow.domain.AI.service;

import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiAnalysisService {

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Value("${flask.url}")
    private String flaskUrl;

    public AiAnalysisResponse getAnalysis(Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 해당 월 거래내역 존재 여부 확인
        YearMonth targetMonth = YearMonth.of(year, month);
        LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime end = targetMonth.plusMonths(1).atDay(1).atStartOfDay();

        boolean hasTransaction = transactionRepository
                .existsByUser_IdAndTransactionAtBetween(userId, start, end);

        if (!hasTransaction) {
            throw new NotFoundException("해당 월의 AI 분석 결과가 없습니다.");
        }

        // 카테고리별 집계 → Flask에 CSV 형태로 전달
        var summaries = transactionRepository
                .findCategoryAmountSummariesByUserIdAndRange(userId, start, end);

        if (summaries.isEmpty()) {
            throw new NotFoundException("해당 월의 AI 분석 결과가 없습니다.");
        }

        // CSV 문자열 생성 (card_tpbuz_nm_2, amt, cnt)
        StringBuilder csv = new StringBuilder("card_tpbuz_nm_2,amt,cnt\n");
        for (var s : summaries) {
            csv.append(s.getCategoryName()).append(",")
                    .append(s.getTotalAmount().intValue()).append(",")
                    .append(1).append("\n"); // cnt는 추후 쿼리에 count 추가 필요
        }

        // Flask /api/advise 호출
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of("csv_text", csv.toString());
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<AiAnalysisResponse> response = restTemplate.exchange(
                flaskUrl + "/api/advise",
                HttpMethod.POST,
                request,
                AiAnalysisResponse.class
        );

        if (response.getBody() == null) {
            throw new NotFoundException("해당 월의 AI 분석 결과가 없습니다.");
        }

        return response.getBody();
    }
}