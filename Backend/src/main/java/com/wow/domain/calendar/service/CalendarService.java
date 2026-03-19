package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.dto.FlaskPreprocessDto;
import com.wow.domain.calendar.dto.TransactionConfirmDto;
import com.wow.domain.calendar.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private final RestTemplate restTemplate;
    private final TransactionRepository transactionRepository;

    @Value("${flask.url}")
    private String flaskUrl;

    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherName("CLOUDY")
                .iconCode("cloudy")
                .description("Check your spending pace")
                .savedAmount(calculateSavedAmount(userId, year, month))
                .build();
    }

    private int calculateSavedAmount(Long userId, int year, int month) {
        YearMonth targetMonth = YearMonth.of(year, month);
        YearMonth currentMonth = YearMonth.from(LocalDate.now());

        if (targetMonth.equals(currentMonth)) {
            return calculateCurrentMonthSavedAmount(userId, targetMonth);
        }

        if (targetMonth.equals(currentMonth.minusMonths(1))) {
            return calculatePreviousMonthSavedAmount(userId, targetMonth);
        }

        return 0;
    }

    private int calculateCurrentMonthSavedAmount(Long userId, YearMonth currentMonth) {
        LocalDate today = LocalDate.now();
        int dayOfMonth = today.getDayOfMonth();

        LocalDateTime currentMonthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime currentMonthToDateEndExclusive = today.plusDays(1).atStartOfDay();

        YearMonth previousMonth = currentMonth.minusMonths(1);
        int previousMonthDay = Math.min(dayOfMonth, previousMonth.lengthOfMonth());
        LocalDate previousMonthLastDate = previousMonth.atDay(previousMonthDay);

        LocalDateTime previousMonthStart = previousMonth.atDay(1).atStartOfDay();
        LocalDateTime previousMonthToDateEndExclusive = previousMonthLastDate.plusDays(1).atStartOfDay();

        BigDecimal currentMonthToDate = transactionRepository.sumAmountByUserAndRange(
                userId, currentMonthStart, currentMonthToDateEndExclusive);
        BigDecimal previousMonthToDate = transactionRepository.sumAmountByUserAndRange(
                userId, previousMonthStart, previousMonthToDateEndExclusive);

        return previousMonthToDate.subtract(currentMonthToDate).intValue();
    }

    private int calculatePreviousMonthSavedAmount(Long userId, YearMonth previousMonth) {
        YearMonth beforePreviousMonth = previousMonth.minusMonths(1);

        LocalDateTime previousMonthStart = previousMonth.atDay(1).atStartOfDay();
        LocalDateTime previousMonthEndExclusive = previousMonth.plusMonths(1).atDay(1).atStartOfDay();

        LocalDateTime beforePreviousMonthStart = beforePreviousMonth.atDay(1).atStartOfDay();
        LocalDateTime beforePreviousMonthEndExclusive = beforePreviousMonth.plusMonths(1).atDay(1).atStartOfDay();

        BigDecimal previousMonthTotal = transactionRepository.sumAmountByUserAndRange(
                userId, previousMonthStart, previousMonthEndExclusive);
        BigDecimal beforePreviousMonthTotal = transactionRepository.sumAmountByUserAndRange(
                userId, beforePreviousMonthStart, beforePreviousMonthEndExclusive);

        return beforePreviousMonthTotal.subtract(previousMonthTotal).intValue();
    }

    public FlaskPreprocessDto preprocessTransactions(MultipartFile bankFile, MultipartFile cardFile) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        if (bankFile != null && !bankFile.isEmpty()) {
            body.add("bank_file", bankFile.getResource());
        }
        if (cardFile != null && !cardFile.isEmpty()) {
            body.add("card_file", cardFile.getResource());
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        return restTemplate.postForObject(
                flaskUrl + "/api/preprocess-transactions",
                request,
                FlaskPreprocessDto.class
        );
    }

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

    @Transactional
    public void confirmTransactions(List<TransactionConfirmDto> items) {
        // TODO: 거래내역 확정 후 DB 저장 로직 추가
    }
}
