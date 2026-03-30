package com.wow.domain.calendar.service;

import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.AI.service.AiAnalysisService;
import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.repository.CalendarRepository;
import com.wow.domain.calendar.repository.FixedExpenseRepository;
import com.wow.domain.calendar.repository.SpendingWeatherRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.repository.ExpenseCategoryRepository;
import com.wow.domain.spendinganalysis.service.SpendingAnalysisService;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private CalendarRepository calendarRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Mock
    private FixedExpenseRepository fixedExpenseRepository;

    @Mock
    private SpendingWeatherRepository spendingWeatherRepository;

    @Mock
    private SpendingAnalysisService spendingAnalysisService;

    @Mock
    private AiAnalysisService aiAnalysisService;

    private CalendarService calendarService;

    @BeforeEach
    void setUp() {
        calendarService = new CalendarService(
                restTemplate,
                calendarRepository,
                transactionRepository,
                userRepository,
                expenseCategoryRepository,
                fixedExpenseRepository,
                spendingWeatherRepository,
                spendingAnalysisService,
                aiAnalysisService
        );
    }

    @ParameterizedTest
    @MethodSource("weatherProfiles")
    void getCalendarHeaderMapsFiveWeatherBands(
            long totalSavable,
            long expectedSpending,
            String expectedWeatherName,
            String expectedIconCode
    ) {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        YearMonth reportMonth = currentMonth.minusMonths(1);

        when(aiAnalysisService.getAnalysis(1L, reportMonth.getYear(), reportMonth.getMonthValue()))
                .thenReturn(createReport(totalSavable, expectedSpending, "커피/음료", totalSavable, null));
        // Current-month savedAmount compares "previous month to date - current month to date".
        when(transactionRepository.sumAmountByUserAndRange(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.valueOf(900_000), BigDecimal.valueOf(1_000_000));

        CalendarHeaderResponse response = calendarService.getCalendarHeader(
                1L,
                currentMonth.getYear(),
                currentMonth.getMonthValue()
        );

        assertThat(response.weatherName()).isEqualTo(expectedWeatherName);
        assertThat(response.iconCode()).isEqualTo(expectedIconCode);
        assertThat(response.savedAmount()).isEqualTo(100_000);
        assertThat(response.description()).isNotBlank();
    }

    @Test
    void getCalendarHeaderUsesGoalActionTipForHigherRiskWeather() {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        YearMonth reportMonth = currentMonth.minusMonths(1);
        String actionTip = "커피/음료를 주 3회 구매로 제한하고 대체 음료를 고정해보세요.";

        when(aiAnalysisService.getAnalysis(1L, reportMonth.getYear(), reportMonth.getMonthValue()))
                .thenReturn(createReport(40L, 60L, "커피/음료", 16_322L, actionTip));
        when(transactionRepository.sumAmountByUserAndRange(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.ZERO, BigDecimal.ZERO);

        CalendarHeaderResponse response = calendarService.getCalendarHeader(
                1L,
                currentMonth.getYear(),
                currentMonth.getMonthValue()
        );

        assertThat(response.weatherName()).isEqualTo("비");
        assertThat(response.description()).isEqualTo(actionTip);
    }

    @Test
    void getCalendarHeaderFallsBackWhenAiReportIsUnavailable() {
        YearMonth currentMonth = YearMonth.from(LocalDate.now());
        YearMonth reportMonth = currentMonth.minusMonths(1);

        when(aiAnalysisService.getAnalysis(1L, reportMonth.getYear(), reportMonth.getMonthValue()))
                .thenThrow(new NotFoundException("최근 3개월 거래 없음"));
        when(aiAnalysisService.getAnalysis(1L, reportMonth.getYear(), reportMonth.getMonthValue(), true))
                .thenThrow(new NotFoundException("최근 3개월 거래 없음"));
        when(aiAnalysisService.getAnalysis(1L, currentMonth.getYear(), currentMonth.getMonthValue()))
                .thenThrow(new NotFoundException("최근 3개월 거래 없음"));
        when(aiAnalysisService.getAnalysis(1L, currentMonth.getYear(), currentMonth.getMonthValue(), true))
                .thenThrow(new NotFoundException("최근 3개월 거래 없음"));
        when(transactionRepository.sumAmountByUserAndRange(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(BigDecimal.ZERO, BigDecimal.ZERO);

        CalendarHeaderResponse response = calendarService.getCalendarHeader(
                1L,
                currentMonth.getYear(),
                currentMonth.getMonthValue()
        );

        assertThat(response.weatherName()).isEqualTo("정보 없음");
        assertThat(response.iconCode()).isNull();
        assertThat(response.description()).isEqualTo("최근 3개월 거래가 부족해 소비 날씨를 계산할 수 없습니다.");
    }

    private static Stream<Arguments> weatherProfiles() {
        return Stream.of(
                Arguments.of(5L, 95L, "맑음", "sunny"),
                Arguments.of(15L, 85L, "구름", "cloudy"),
                Arguments.of(25L, 75L, "흐림", "overcast"),
                Arguments.of(40L, 60L, "비", "rain"),
                Arguments.of(60L, 40L, "폭우", "heavy-rain")
        );
    }

    private AiAnalysisResponse createReport(
            long totalSavable,
            long expectedSpending,
            String overspendingCategory,
            long savableAmount,
            String actionTip
    ) {
        return AiAnalysisResponse.builder()
                .cluster(AiAnalysisResponse.Cluster.builder()
                        .id(1)
                        .name("배움집중형")
                        .description("도서/교육용품과 지식/독서 비중이 높은 유형")
                        .icon("book")
                        .build())
                .categories(List.of(
                        AiAnalysisResponse.Category.builder()
                                .name(overspendingCategory)
                                .amount(233_500L)
                                .myRatio(23.3)
                                .baseRatio(8.9)
                                .diff(14.4)
                                .build()
                ))
                .overspending(List.of(
                        AiAnalysisResponse.Overspending.builder()
                                .name(overspendingCategory)
                                .myRatio(23.3)
                                .baseRatio(8.9)
                                .savableAmount(savableAmount)
                                .build()
                ))
                .summary(AiAnalysisResponse.Summary.builder()
                        .totalSavable(totalSavable)
                        .expectedSpending(expectedSpending)
                        .build())
                .tips(List.of(
                        AiAnalysisResponse.Tip.builder()
                                .order(1)
                                .keyword(overspendingCategory)
                                .title(overspendingCategory + " 지출을 아껴보세요")
                                .description("이 항목의 소비 비중이 기준보다 높습니다.")
                                .build()
                ))
                .goal(AiAnalysisResponse.Goal.builder()
                        .savableAmount(totalSavable)
                        .expectedSpending(expectedSpending)
                        .actionTip(actionTip)
                        .build())
                .build();
    }
}
