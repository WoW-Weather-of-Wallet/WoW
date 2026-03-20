package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.entity.DayType;
import com.wow.domain.calendar.entity.SpendingWeather;
import com.wow.domain.calendar.entity.Transaction;
import com.wow.domain.calendar.repository.CalendarRepository;
import com.wow.domain.calendar.repository.ExpenseCategoryRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.entity.ExpenseCategory;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.common.BusinessException;
import com.wow.global.common.ErrorCode;
import lombok.RequiredArgsConstructor;
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
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private static final String DEFAULT_WEATHER_NAME = "정보 없음";
    private static final String DEFAULT_DESCRIPTION = "날씨 정보가 없습니다.";

    private final RestTemplate restTemplate;
    private final CalendarRepository calendarRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;

    @Value("${flask.url}")
    private String flaskUrl;

    // ── 캘린더 헤더 ──
    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
        TodayWeatherInfo todayWeatherInfo = getTodayWeatherInfo(userId);

        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherName(todayWeatherInfo.weatherName())
                .iconCode(todayWeatherInfo.iconCode())
                .description(todayWeatherInfo.description())
                .savedAmount(calculateSavedAmount(userId, year, month))
                .build();
    }

    public List<CalendarMonthlyResponse> getCalendarMonthly(Long userId, int year, int month) {
        LocalDate startDate = YearMonth.of(year, month).atDay(1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDate today = LocalDate.now();

        return calendarRepository.findMonthlyByUserIdWithWeather(userId, startDate, endDate).stream()
                .map(calendar -> new CalendarMonthlyResponse(
                        calendar.getDate(),
                        resolveDayType(calendar.getDate(), today),
                        calendar.getDailyTotal(),
                        calendar.getSpendingWeather() != null ? calendar.getSpendingWeather().getIconCode() : null,
                        resolveForecastCode(calendar.getDate(), today)
                ))
                .toList();
    }

    private TodayWeatherInfo getTodayWeatherInfo(Long userId) {
        LocalDate today = LocalDate.now();

        return calendarRepository.findByUserIdAndDateWithWeather(userId, today)
                .map(calendar -> {
                    SpendingWeather spendingWeather = calendar.getSpendingWeather();
                    String weatherName = spendingWeather != null ? spendingWeather.getWeatherName() : DEFAULT_WEATHER_NAME;
                    String iconCode = spendingWeather != null ? spendingWeather.getIconCode() : null;
                    String description = calendar.getDescription() != null ? calendar.getDescription() : DEFAULT_DESCRIPTION;
                    return new TodayWeatherInfo(weatherName, iconCode, description);
                })
                .orElse(new TodayWeatherInfo(DEFAULT_WEATHER_NAME, null, DEFAULT_DESCRIPTION));
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

    // ── ① 파일 전처리 + Flask 분류 ──
    public FlaskPreprocessDto preprocessTransactions(
            MultipartFile bankFile, MultipartFile cardFile) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (bankFile != null && !bankFile.isEmpty()) {
            final String filename = bankFile.getOriginalFilename();
            final byte[] bytes = bankFile.getBytes();
            body.add("bank_file", new ByteArrayResource(bytes) {
                @Override public String getFilename() { return filename; }
            });
        }

        if (cardFile != null && !cardFile.isEmpty()) {
            final String filename = cardFile.getOriginalFilename();
            final byte[] bytes = cardFile.getBytes();
            body.add("card_file", new ByteArrayResource(bytes) {
                @Override public String getFilename() { return filename; }
            });
        }

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(
                flaskUrl + "/api/preprocess-transactions", request, FlaskPreprocessDto.class);
    }

    // ── ② 미분류 항목 재분류 저장 ──
    public void saveOverrides(List<Map<String, String>> rows) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new HashMap<>();
        body.put("rows", rows);
        restTemplate.postForObject(
                flaskUrl + "/api/overrides",
                new HttpEntity<>(body, headers),
                Object.class);
    }

    // ── ③ 최종 확정 후 DB 저장 (덮어쓰기) ──
    @Transactional
    public TransactionConfirmResponse confirmTransactions(
            Long userId, TransactionConfirmRequest request) {

        List<TransactionConfirmRequest.TransactionItem> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_STAGE_ID);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        LocalDate representativeDate = items.get(0).getTransactionDate();
        LocalDateTime dayStart = representativeDate.atStartOfDay();
        LocalDateTime dayEnd = representativeDate.atTime(23, 59, 59);

        // 같은 날짜 기존 데이터 삭제 (덮어쓰기)
        transactionRepository.deleteByUser_IdAndTransactionAtBetween(
                userId, dayStart, dayEnd);

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

    // ── ④ 거래내역 직접 입력 (다건) ──
    @Transactional
    public TransactionCustomResponse createCustomTransaction(
            Long userId, TransactionCustomRequest request) {

        List<TransactionCustomRequest.TransactionCustomItem> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_STAGE_ID);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

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

        List<TransactionCustomResponse.TransactionCustomItem> responseItems = entities.stream()
                .map(TransactionCustomResponse.TransactionCustomItem::from)
                .toList();

        return new TransactionCustomResponse(entities.size(), responseItems);
    }

    // ── xls/xlsx → csv 변환 ──
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

    private DayType resolveDayType(LocalDate targetDate, LocalDate today) {
        if (targetDate.isBefore(today)) {
            return DayType.PAST;
        }
        if (targetDate.isEqual(today)) {
            return DayType.TODAY;
        }
        if (!targetDate.isAfter(today.plusDays(7))) {
            return DayType.NEAR_FUTURE;
        }
        return DayType.FAR_FUTURE;
    }

    private Integer resolveForecastCode(LocalDate targetDate, LocalDate today) {
        if (targetDate.isBefore(today)) {
            return 0;
        }
        if (!targetDate.isAfter(today.plusDays(7))) {
            return 1;
        }
        return null;
    }

    private record TodayWeatherInfo(String weatherName, String iconCode, String description) {}
}
