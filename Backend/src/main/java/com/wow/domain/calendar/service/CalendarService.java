package com.wow.domain.calendar.service;

import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.AI.service.AiAnalysisService;
import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.entity.*;
import com.wow.domain.calendar.entity.Calendar;
import com.wow.domain.calendar.repository.CalendarRepository;
import com.wow.domain.calendar.repository.FixedExpenseRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.entity.ExpenseCategory;
import com.wow.domain.expensecategory.repository.ExpenseCategoryRepository;
import com.wow.domain.spendinganalysis.service.SpendingAnalysisService;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.ForbiddenException;
import com.wow.global.exception.InternalServerException;
import com.wow.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private static final String MONTHLY_DEFAULT_WEATHER_NAME = "정보 없음";
    private static final String MONTHLY_DEFAULT_DESCRIPTION = "최근 3개월 거래가 부족해 소비 날씨를 계산할 수 없습니다.";
    private static final double SUNNY_THRESHOLD = 0.10d;
    private static final double CLOUDY_THRESHOLD = 0.20d;
    private static final double OVERCAST_THRESHOLD = 0.30d;
    private static final double RAIN_THRESHOLD = 0.50d;

    private static final String DEFAULT_WEATHER_NAME = "정보 없음";
    private static final String DEFAULT_DESCRIPTION = "날씨 정보가 없습니다.";

    private final RestTemplate restTemplate;
    private final CalendarRepository calendarRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final FixedExpenseRepository fixedExpenseRepository;
    private final SpendingAnalysisService spendingAnalysisService;
    private final AiAnalysisService aiAnalysisService;

    @Value("${flask.url}")
    private String flaskUrl;

    // ── 캘린더 헤더 ──
    public CalendarHeaderResponse getCalendarHeader(Long userId, int year, int month) {
        MonthlyWeatherInfo monthlyWeatherInfo = resolveMonthlyWeatherInfo(userId, year, month);

        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherName(monthlyWeatherInfo.weatherName())
                .iconCode(monthlyWeatherInfo.iconCode())
                .description(monthlyWeatherInfo.description())
                .savedAmount(calculateSavedAmount(userId, year, month))
                .build();
    }

    public CalendarDailyResponse getCalendarDaily(Long userId, LocalDate date) {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
        Optional<Calendar> calendarOptional = calendarRepository.findByUserIdAndDateWithWeather(userId, date);
        DailyWeatherInfo weatherInfo = calendarOptional
                .map(this::toDailyWeatherInfo)
                .orElseGet(this::defaultDailyWeatherInfo);
        Integer forecastCode = resolveForecastCode(date, today);
        List<CalendarDailyResponse.TransactionItem> transactions = transactionRepository
                .findDailyByUserIdWithCategory(userId, dayStart, dayEnd).stream()
                .map(transaction -> new CalendarDailyResponse.TransactionItem(
                        transaction.getMerchantName(),
                        transaction.getCategory().getCategoryName(),
                        transaction.getCategory().getCategoryIcon(),
                        transaction.getAmount().intValue()
                ))
                .toList();

        CalendarDailyResponse.Weather weather = CalendarDailyResponse.Weather.builder()
                .iconCode(weatherInfo.iconCode())
                .weatherName(weatherInfo.weatherName())
                .description(weatherInfo.description())
                .isForecast(forecastCode)
                .build();

        return calendarOptional
                .map(calendar -> CalendarDailyResponse.builder()
                        .calendarId(calendar.getId())
                        .date(date)
                        .weather(weather)
                        .summary(CalendarDailyResponse.Summary.builder()
                                .totalExpense(calendar.getDailyTotal() != null ? calendar.getDailyTotal().intValue() : null)
                                .transactionCount(calendar.getTransactionCount())
                                .build())
                        .transactions(transactions)
                        .memo(calendar.getMemo())
                        .build())
                .orElseGet(() -> CalendarDailyResponse.builder()
                        .calendarId(null)
                        .date(date)
                        .weather(weather)
                        .summary(CalendarDailyResponse.Summary.builder()
                                .totalExpense(null)
                                .transactionCount(null)
                                .build())
                        .transactions(transactions)
                        .memo(null)
                        .build());
    }

    public List<CalendarMonthlyResponse> getCalendarMonthly(Long userId, int year, int month) {
        LocalDate startDate = YearMonth.of(year, month).atDay(1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDate today = LocalDate.now();

        return calendarRepository.findMonthlyByUserIdWithWeather(userId, startDate, endDate).stream()
                .map(calendar -> {
                    DayType dayType = resolveDayType(calendar.getDate(), today);
                    String iconCode = dayType == DayType.FAR_FUTURE
                            ? null
                            : (calendar.getSpendingWeather() != null
                            ? calendar.getSpendingWeather().getIconCode() : null);

                    return new CalendarMonthlyResponse(
                            calendar.getDate(),
                            dayType,
                            calendar.getDailyTotal(),
                            iconCode,
                            resolveForecastCode(calendar.getDate(), today)
                    );
                })
                .toList();
    }

    private DailyWeatherInfo getDailyWeatherInfo(Long userId, LocalDate date) {
        return calendarRepository.findByUserIdAndDateWithWeather(userId, date)
                .map(this::toDailyWeatherInfo)
                .orElseGet(this::defaultDailyWeatherInfo);
    }

    private DailyWeatherInfo toDailyWeatherInfo(Calendar calendar) {
        SpendingWeather spendingWeather = calendar.getSpendingWeather();
        String weatherName = spendingWeather != null ? spendingWeather.getWeatherName() : DEFAULT_WEATHER_NAME;
        String iconCode = spendingWeather != null ? spendingWeather.getIconCode() : null;
        String description = calendar.getDescription() != null ? calendar.getDescription() : DEFAULT_DESCRIPTION;
        return new DailyWeatherInfo(weatherName, iconCode, description);
    }

    private DailyWeatherInfo defaultDailyWeatherInfo() {
        return new DailyWeatherInfo(DEFAULT_WEATHER_NAME, null, DEFAULT_DESCRIPTION);
    }

    private MonthlyWeatherInfo resolveMonthlyWeatherInfo(Long userId, int year, int month) {
        try {
            return buildMonthlyWeatherInfo(aiAnalysisService.getAnalysis(userId, year, month));
        } catch (NotFoundException | InternalServerException exception) {
            return defaultMonthlyWeatherInfo();
        }
    }

    private MonthlyWeatherInfo buildMonthlyWeatherInfo(AiAnalysisResponse report) {
        long totalSavable = report.getSummary() != null && report.getSummary().getTotalSavable() != null
                ? report.getSummary().getTotalSavable()
                : 0L;
        long expectedSpending = report.getSummary() != null && report.getSummary().getExpectedSpending() != null
                ? report.getSummary().getExpectedSpending()
                : 0L;
        long totalObservedSpending = Math.max(expectedSpending + totalSavable, 1L);
        double savingsRatio = (double) totalSavable / totalObservedSpending;

        WeatherProfile weatherProfile = resolveWeatherProfile(savingsRatio);
        String description = buildMonthlyWeatherDescription(report, totalSavable, weatherProfile.weatherName());

        return new MonthlyWeatherInfo(
                weatherProfile.weatherName(),
                weatherProfile.iconCode(),
                description
        );
    }

    // 프론트 가이드가 10/20/30/50% 절감 여지 구간으로 5단계를 쓰고 있어서
    // 동일한 기준을 백엔드 헤더 응답에도 그대로 맞춘다.
    private WeatherProfile resolveWeatherProfile(double savingsRatio) {
        if (savingsRatio < SUNNY_THRESHOLD) {
            return new WeatherProfile("맑음", "sunny");
        }
        if (savingsRatio < CLOUDY_THRESHOLD) {
            return new WeatherProfile("구름", "cloudy");
        }
        if (savingsRatio < OVERCAST_THRESHOLD) {
            return new WeatherProfile("흐림", "overcast");
        }
        if (savingsRatio < RAIN_THRESHOLD) {
            return new WeatherProfile("비", "rain");
        }
        return new WeatherProfile("폭우", "heavy-rain");
    }

    private String buildMonthlyWeatherDescription(
            AiAnalysisResponse report,
            long totalSavable,
            String weatherName
    ) {
        String actionTip = report.getGoal() != null ? report.getGoal().getActionTip() : null;
        if (actionTip != null && !actionTip.isBlank() && totalSavable > 0 && !"맑음".equals(weatherName)) {
            return actionTip;
        }

        AiAnalysisResponse.Overspending primaryOverspending = report.getOverspending() != null
                && !report.getOverspending().isEmpty()
                ? report.getOverspending().getFirst()
                : null;

        if (primaryOverspending == null || primaryOverspending.getName() == null || primaryOverspending.getName().isBlank()) {
            if (totalSavable <= 0) {
                return "최근 3개월 소비 흐름이 비교적 안정적이에요. 지금 패턴을 유지해보세요.";
            }
            return String.format(
                    "최근 3개월 기준 약 %,d원 절약 여지가 보여요. 주요 소비 카테고리를 한 번 점검해보세요.",
                    totalSavable
            );
        }

        String categoryName = primaryOverspending.getName();
        long savableAmount = primaryOverspending.getSavableAmount() != null
                ? primaryOverspending.getSavableAmount()
                : totalSavable;

        return switch (weatherName) {
            case "맑음" -> String.format(
                    "%s 지출이 조금 높지만 전반적으로는 안정적이에요. 약 %,d원 정도만 가볍게 점검해보세요.",
                    categoryName,
                    savableAmount
            );
            case "구름" -> String.format(
                    "%s 지출을 조금만 다듬으면 약 %,d원 더 아낄 수 있어요.",
                    categoryName,
                    savableAmount
            );
            case "흐림" -> String.format(
                    "%s 비중이 기준보다 높아요. 약 %,d원 절약할 수 있어 먼저 점검해보세요.",
                    categoryName,
                    savableAmount
            );
            case "비" -> String.format(
                    "%s 지출이 크게 높아요. 약 %,d원 절약 여지가 있어 이번 달 관리 우선순위로 추천해요.",
                    categoryName,
                    savableAmount
            );
            default -> String.format(
                    "%s 과소비 신호가 강해요. 약 %,d원 절약 가능하니 가장 먼저 관리해보세요.",
                    categoryName,
                    savableAmount
            );
        };
    }

    private MonthlyWeatherInfo defaultMonthlyWeatherInfo() {
        return new MonthlyWeatherInfo(MONTHLY_DEFAULT_WEATHER_NAME, null, MONTHLY_DEFAULT_DESCRIPTION);
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
            throw new BadRequestException("거래내역 항목이 비어있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        LocalDate representativeDate = items.get(0).getTransactionDate();

        // ↓ 여기만 변경 - paymentType CARD만 삭제
        Set<LocalDate> dates = items.stream()
                .map(TransactionConfirmRequest.TransactionItem::getTransactionDate)
                .collect(Collectors.toSet());

        for (LocalDate date : dates) {
            deleteTransactionsByDateAndType(userId, date, "CARD");
        }

        List<Transaction> entities = items.stream()
                .map(item -> {
                    ExpenseCategory category = expenseCategoryRepository
                            .findById(item.getCategoryId())
                            .orElseThrow(() -> new BadRequestException("존재하지 않는 카테고리입니다."));

                    return Transaction.builder()
                            .user(user)
                            .category(category)
                            .amount(BigDecimal.valueOf(item.getAmount()))
                            .merchantName(item.getMerchantName())
                            .transactionAt(item.getTransactionDate().atStartOfDay())
                            .paymentType("CARD")  // ← 추가
                            .build();
                })
                .toList();

        transactionRepository.saveAll(entities);

// Set<LocalDate> 제거하고 그냥 재사용
        for (LocalDate date : dates) {
            recalculateDailySummary(userId, date);
        }
        evictAnalysisCaches(userId, dates);
        return new TransactionConfirmResponse(entities.size(), representativeDate);
    }

    // ── ④ 거래내역 직접 입력 (다건) ──
    @Transactional
    public TransactionCustomResponse createCustomTransaction(
            Long userId, TransactionCustomRequest request) {

        List<TransactionCustomRequest.TransactionCustomItem> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new BadRequestException("거래내역 항목이 비어있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 날짜별로 같은 날짜 CARD 타입 삭제
//        Set<LocalDate> dates = items.stream()
//                .map(TransactionCustomRequest.TransactionCustomItem::getTransactionDate)
//                .collect(Collectors.toSet());
//
//        for (LocalDate date : dates) {
//            deleteTransactionsByDateAndType(userId, date, "CARD");
//        }

        List<Transaction> entities = items.stream()
                .map(item -> {
                    ExpenseCategory category = expenseCategoryRepository
                            .findById(item.getCategoryId())
                            .orElseThrow(() -> new BadRequestException("존재하지 않는 카테고리입니다."));

                    return Transaction.builder()
                            .user(user)
                            .category(category)
                            .amount(BigDecimal.valueOf(item.getAmount()))
                            .merchantName(item.getMerchantName())
                            .transactionAt(item.getTransactionDate().atStartOfDay())
                            .paymentType("CARD")  // ← 추가
                            .build();
                })
                .toList();

        transactionRepository.saveAll(entities);

        Set<LocalDate> dates = entities.stream()
                .map(t -> t.getTransactionAt().toLocalDate())
                .collect(Collectors.toSet());
        for (LocalDate date : dates) {
            recalculateDailySummary(userId, date);
        }

        evictAnalysisCaches(userId, dates);

        List<TransactionCustomResponse.TransactionCustomItem> responseItems = entities.stream()
                .map(TransactionCustomResponse.TransactionCustomItem::from)
                .toList();

        return new TransactionCustomResponse(entities.size(), responseItems);
    }

    // ── ⑤ 고정지출 목록 조회 ──
    public FixedExpenseResponse getFixedExpenses(Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        List<FixedExpense> fixedExpenses =
                fixedExpenseRepository.findByUser_IdAndIsEnableTrue(userId);

        List<FixedExpenseResponse.FixedExpenseItem> items = fixedExpenses.stream()
                .map(fe -> FixedExpenseResponse.FixedExpenseItem.of(
                        fe, year, month, transactionRepository))
                .toList();

        int totalAmount = items.stream()
                .mapToInt(FixedExpenseResponse.FixedExpenseItem::getAmount)
                .sum();

        return new FixedExpenseResponse(totalAmount, items);
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

    private record DailyWeatherInfo(String weatherName, String iconCode, String description) {}

    private record MonthlyWeatherInfo(String weatherName, String iconCode, String description) {}

    private record WeatherProfile(String weatherName, String iconCode) {}

    // 전체 거래내역 조회
    public CalendarTransactionResponse getCalendarTransactions(
            Long userId, int year, int month) {

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 해당 월 시작/끝
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, month,
                YearMonth.of(year, month).lengthOfMonth(), 23, 59, 59);

        // 거래내역 조회
        List<Transaction> transactions =
                transactionRepository
                        .findByUser_IdAndTransactionAtBetweenOrderByTransactionAtDesc(
                                userId, start, end);

        // 고정지출 가맹점명 목록 한번에 조회 (핀 표시용)
        Set<String> fixedNames = fixedExpenseRepository.findNamesByUserId(userId);

        // 월 총 지출 합계
        int totalAmount = transactions.stream()
                .mapToInt(t -> t.getAmount().intValue())
                .sum();

        // 날짜별 그룹핑
        Map<LocalDate, List<Transaction>> groupedByDate = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getTransactionAt().toLocalDate(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        // DailyItem 생성
        List<CalendarTransactionResponse.DailyItem> items = groupedByDate.entrySet().stream()
                .map(entry -> {
                    List<CalendarTransactionResponse.TransactionItem> txItems =
                            entry.getValue().stream()
                                    .map(t -> new CalendarTransactionResponse.TransactionItem(
                                            t.getId(),
                                            t.getCategory() != null
                                                    ? t.getCategory().getCategoryIcon() : null,
                                            t.getMerchantName(),
                                            t.getCategory() != null
                                                    ? t.getCategory().getCategoryName() : null,
                                            t.getAmount().intValue(),
                                            fixedNames.contains(t.getMerchantName()),
                                            t.getPaymentType()  // ← 이것만 추가
                                    ))
                                    .toList();

                    return new CalendarTransactionResponse.DailyItem(
                            entry.getKey().toString(),
                            txItems
                    );
                })
                .toList();

        return new CalendarTransactionResponse(
                year + "-" + String.format("%02d", month),
                totalAmount,
                items
        );
    }

    // 직접거래내역삭제
//    @Transactional
//    public void deleteTransaction(Long userId, Long transactionId) {
//
//        Transaction transaction = transactionRepository.findById(transactionId)
//                .orElseThrow(() -> new NotFoundException("거래내역을 찾을 수 없습니다."));
//
//        if (!transaction.getUser().getId().equals(userId)) {
//            throw new ForbiddenException("삭제 권한이 없습니다.");
//        }
//
//        transactionRepository.delete(transaction);
//        spendingAnalysisService.evictMonthlyCompareCache(userId);
//    }
    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("거래내역을 찾을 수 없습니다."));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new ForbiddenException("삭제 권한이 없습니다.");
        }

        LocalDate date = transaction.getTransactionAt().toLocalDate(); // 삭제 전에 날짜 저장
        transactionRepository.delete(transaction);
        recalculateDailySummary(userId, date); // 삭제 후 재계산
        evictAnalysisCaches(userId, List.of(date));
    }

    // 현금 처리로 인해서 삭제로직 변경
    private void deleteTransactionsByDateAndType(
            Long userId, LocalDate date, String paymentType) {

        // 고정지출에 연결된 id는 삭제 제외
        Set<Long> fixedTransactionIds =
                fixedExpenseRepository.findTransactionIdsByUserId(userId);

        List<Long> toDeleteIds = transactionRepository
                .findIdsByUserIdAndPaymentTypeAndTransactionAtBetween(
                        userId,
                        paymentType,
                        date.atStartOfDay(),
                        date.plusDays(1).atStartOfDay())
                .stream()
                .filter(id -> !fixedTransactionIds.contains(id))
                .toList();

        transactionRepository.deleteAllById(toDeleteIds);
    }

    // 현금로직 추가
    @Transactional
    public TransactionCustomResponse createCashTransaction(
            Long userId, TransactionCustomRequest request) {

        List<TransactionCustomRequest.TransactionCustomItem> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new BadRequestException("거래내역 항목이 비어있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // 같은 날짜 CASH 타입만 삭제
//        Set<LocalDate> dates = items.stream()
//                .map(TransactionCustomRequest.TransactionCustomItem::getTransactionDate)
//                .collect(Collectors.toSet());
//
//        for (LocalDate date : dates) {
//            deleteTransactionsByDateAndType(userId, date, "CASH");
//        }

        List<Transaction> entities = items.stream()
                .map(item -> {
                    ExpenseCategory category = expenseCategoryRepository
                            .findById(item.getCategoryId())
                            .orElseThrow(() -> new BadRequestException("존재하지 않는 카테고리입니다."));

                    return Transaction.builder()
                            .user(user)
                            .category(category)
                            .amount(BigDecimal.valueOf(item.getAmount()))
                            .merchantName(item.getMerchantName())
                            .transactionAt(item.getTransactionDate().atStartOfDay())
                            .paymentType("CASH")  // ← CASH
                            .build();
                })
                .toList();

        // createCashTransaction() 마지막에 추가
        transactionRepository.saveAll(entities);

// 날짜별로 summary 재계산
        Set<LocalDate> dates = entities.stream()
                .map(t -> t.getTransactionAt().toLocalDate())
                .collect(Collectors.toSet());
        for (LocalDate date : dates) {
            recalculateDailySummary(userId, date);
        }

        evictAnalysisCaches(userId, dates);

        List<TransactionCustomResponse.TransactionCustomItem> responseItems = entities.stream()
                .map(TransactionCustomResponse.TransactionCustomItem::from)
                .toList();


        return new TransactionCustomResponse(entities.size(), responseItems);
    }

    @Transactional
    public CalendarMemoResponse updateMemo(Long userId, LocalDate date, String memo) {
        DayType dayType = resolveDayType(date, LocalDate.now());
        Calendar calendar = calendarRepository.findByUserIdAndDateWithWeather(userId, date)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
                    LocalDateTime now = LocalDateTime.now();
                    return calendarRepository.save(
                            Calendar.builder()
                                    .user(user)
                                    .date(date)
                                    .dayType(dayType)
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build()
                    );
                });

        calendar.updateDayType(dayType);
        calendar.updateMemo(memo);
        return new CalendarMemoResponse(calendar.getId(), calendar.getMemo());
    }

    @Transactional
    public void recalculateDailySummary(Long userId, LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        // Upsert policy: create a calendar row only when transactions exist for the day.
        List<Transaction> transactions =
                transactionRepository.findDailyByUserIdWithCategory(userId, dayStart, dayEnd);

        Optional<Calendar> calendarOptional = calendarRepository.findByUserIdAndDateWithWeather(userId, date);
        if (calendarOptional.isEmpty() && transactions.isEmpty()) {
            return;
        }

        DayType dayType = resolveDayType(date, LocalDate.now());
        Calendar calendar = calendarOptional.orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
            LocalDateTime now = LocalDateTime.now();
            return calendarRepository.save(
                    Calendar.builder()
                            .user(user)
                            .date(date)
                            .dayType(dayType)
                            .createdAt(now)
                            .updatedAt(now)
                            .build()
            );
        });

        BigDecimal totalExpense = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        calendar.updateDailySummary(totalExpense, transactions.size());
        calendar.updateDayType(dayType);
    }

    private void evictAnalysisCaches(Long userId, Collection<LocalDate> transactionDates) {
        // Monthly compare is a lightweight current view cache, while the AI report
        // cache/snapshot is a 3-month rolling artifact that can be stale for the
        // edited month and the next 2 target months.
        spendingAnalysisService.evictMonthlyCompareCache(userId);
        aiAnalysisService.evictMonthlyAiReportCaches(userId, transactionDates);
    }
}
