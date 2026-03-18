package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.dto.FlaskPreprocessDto;
import com.wow.domain.calendar.dto.TransactionConfirmDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private final RestTemplate restTemplate;

    @Value("${flask.url}")
    private String flaskUrl;

    // 캘린더 헤더 코드
    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherName("CLOUDY")
                .iconCode("cloudy")
                .desc("외식 지출 패턴 감지됨")
                .savedAmount(101000)
                .build();
    }

    // ─── Flask 연동

    // ① 파일 전처리 + GMM 분류
    public FlaskPreprocessDto preprocessTransactions(
            MultipartFile bankFile, MultipartFile cardFile) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        if (bankFile != null && !bankFile.isEmpty())
            body.add("bank_file", bankFile.getResource());
        if (cardFile != null && !cardFile.isEmpty())
            body.add("card_file", cardFile.getResource());

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        return restTemplate.postForObject(
                flaskUrl + "/api/preprocess-transactions",
                request,
                FlaskPreprocessDto.class
        );
    }

    // ② 미분류 항목 재분류 저장
    public void saveOverrides(List<Map<String, String>> rows) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("rows", rows);

        restTemplate.postForObject(
                flaskUrl + "/api/overrides",
                new HttpEntity<>(body, headers),
                Object.class
        );
    }

    // ③ 최종 확정 후 DB 저장
    @Transactional
    public void confirmTransactions(List<TransactionConfirmDto> items) {
        // TODO: Repository 연결 후 DB 저장 로직 구현
    }
}