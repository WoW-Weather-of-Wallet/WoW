//package com.wow.domain.calendar.service;
//
//import com.wow.domain.calendar.dto.CalendarHeaderResponse;
//import com.wow.domain.calendar.dto.FlaskPreprocessDto;
//import com.wow.domain.calendar.dto.TransactionConfirmDto;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.util.MultiValueMap;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//@Transactional(readOnly = true)
//public class CalendarService {
//
//    private final RestTemplate restTemplate;
//
//    @Value("${flask.url}")
//    private String flaskUrl;
//
//    // 캘린더 헤더 코드
//    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
//        return CalendarHeaderResponse.builder()
//                .yearMonth(year + "-" + String.format("%02d", month))
//                .weatherStatus("CLOUDY")
//                .weatherIcon("cloudy")
//                .weatherDescription("외식 지출 패턴 감지됨")
//                .savedAmount(101000)
//                .build();
//    }
//
//    // ─── Flask 연동
//
//    // ① 파일 전처리 + GMM 분류
//    public FlaskPreprocessDto preprocessTransactions(
//            MultipartFile bankFile, MultipartFile cardFile) {
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//
//        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
//        if (bankFile != null && !bankFile.isEmpty())
//            body.add("bank_file", bankFile.getResource());
//        if (cardFile != null && !cardFile.isEmpty())
//            body.add("card_file", cardFile.getResource());
//
//        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
//
//        return restTemplate.postForObject(
//                flaskUrl + "/api/preprocess-transactions",
//                request,
//                FlaskPreprocessDto.class
//        );
//    }
//
//    // ② 미분류 항목 재분류 저장
//    public void saveOverrides(List<Map<String, String>> rows) {
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("rows", rows);
//
//        restTemplate.postForObject(
//                flaskUrl + "/api/overrides",
//                new HttpEntity<>(body, headers),
//                Object.class
//        );
//    }
//
//    // ③ 최종 확정 후 DB 저장
//    @Transactional
//    public void confirmTransactions(List<TransactionConfirmDto> items) {
//        // TODO: Repository 연결 후 DB 저장 로직 구현
//    }
//
//
//}

package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.entity.Transaction;
import com.wow.domain.calendar.repository.ExpenseCategoryRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.entity.ExpenseCategory;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.wow.global.common.BusinessException;
import com.wow.global.common.ErrorCode;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private final RestTemplate restTemplate;

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;

    @Value("${flask.url}")
    private String flaskUrl;

    // 캘린더 헤더 코드
    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherStatus("CLOUDY")
                .weatherIcon("cloudy")
                .weatherDescription("외식 지출 패턴 감지됨")
                .savedAmount(101000)
                .build();
    }

    // ── Flask 연동 ──

    // ① 파일 전처리 + GMM 분류
    public FlaskPreprocessDto preprocessTransactions(
            MultipartFile bankFile, MultipartFile cardFile) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (bankFile != null && !bankFile.isEmpty()) {
            final String filename = bankFile.getOriginalFilename();
            final byte[] bytes = bankFile.getBytes();
            body.add("bank_file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() { return filename; }
            });
        }

        if (cardFile != null && !cardFile.isEmpty()) {
            final String filename = cardFile.getOriginalFilename();
            final byte[] bytes = cardFile.getBytes();
            body.add("card_file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() { return filename; }
            });
        }

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
//    @Transactional
//    public void confirmTransactions(List<TransactionConfirmDto> items) {
//        // TODO: Repository 연결 후 DB 저장 로직 구현
//    }
    @Transactional
    public TransactionConfirmResponse confirmTransactions(
            Long userId, TransactionConfirmRequest request) {

        List<TransactionConfirmRequest.TransactionItem> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_STAGE_ID);
        }

        // userId로 User 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 대표 날짜 기준 중복 체크 (날짜 전체 범위로 검색)
        LocalDate representativeDate = items.get(0).getTransactionDate();
        LocalDateTime dayStart = representativeDate.atStartOfDay();
        LocalDateTime dayEnd = representativeDate.atTime(23, 59, 59);

        if (transactionRepository.existsByUser_IdAndTransactionAtBetween(
                userId, dayStart, dayEnd)) {
            throw new BusinessException(ErrorCode.DUPLICATE_TRANSACTION);
        }

        // 엔티티 변환 및 저장
        List<Transaction> entities = items.stream()
                .map(item -> {
                    ExpenseCategory category = expenseCategoryRepository
                            .findById(item.getCategoryId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_STAGE_ID));

                    return Transaction.builder()
                            .user(user)
                            .category(category)
                            .amount(BigDecimal.valueOf(item.getAmount()))
                            .merchantName(item.getMerchantName())
                            .transactionAt(item.getTransactionDate().atStartOfDay())
                            .createdAt(LocalDateTime.now())
                            .build();
                })
                .toList();

        transactionRepository.saveAll(entities);

        return new TransactionConfirmResponse(entities.size(), representativeDate);
    }

    // xls/xlsx → csv 변환
    private String convertXlsToCsv(MultipartFile file) throws Exception {
        StringBuilder csv = new StringBuilder();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                StringBuilder line = new StringBuilder();
                for (Cell cell : row) {
                    if (line.length() > 0) line.append(",");
                    switch (cell.getCellType()) {
                        case STRING  -> line.append(cell.getStringCellValue());
                        case NUMERIC -> {
                            if (DateUtil.isCellDateFormatted(cell)) {
                                line.append(cell.getLocalDateTimeCellValue().toLocalDate());
                            } else {
                                long val = (long) cell.getNumericCellValue();
                                line.append(val);
                            }
                        }
                        case BOOLEAN -> line.append(cell.getBooleanCellValue());
                        default      -> line.append("");
                    }
                }
                csv.append(line).append("\n");
            }
        }
        return csv.toString();
    }
}