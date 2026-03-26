package com.wow.domain.AI.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.expensecategory.entity.ExpenseCategory;
import com.wow.domain.expensecategory.repository.ExpenseCategoryRepository;
import com.wow.domain.spendinganalysis.entity.AiAnalysis;
import com.wow.domain.spendinganalysis.entity.AiAnalysisCategoryResult;
import com.wow.domain.spendinganalysis.entity.AiAnalysisType;
import com.wow.domain.spendinganalysis.entity.SpendingType;
import com.wow.domain.spendinganalysis.repository.AiAnalysisCategoryResultRepository;
import com.wow.domain.spendinganalysis.repository.AiAnalysisRepository;
import com.wow.domain.spendinganalysis.repository.SpendingTypeRepository;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.constant.RedisKeys;
import com.wow.global.exception.InternalServerException;
import com.wow.global.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiAnalysisServiceTest {

    @Mock
    private RestTemplate aiRestTemplate;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Mock
    private SpendingTypeRepository spendingTypeRepository;

    @Mock
    private AiAnalysisRepository aiAnalysisRepository;

    @Mock
    private AiAnalysisCategoryResultRepository aiAnalysisCategoryResultRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private AiAnalysisService aiAnalysisService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        aiAnalysisService = new AiAnalysisService(
                aiRestTemplate,
                transactionRepository,
                expenseCategoryRepository,
                spendingTypeRepository,
                aiAnalysisRepository,
                aiAnalysisCategoryResultRepository,
                userRepository,
                redisTemplate,
                objectMapper
        );
        ReflectionTestUtils.setField(aiAnalysisService, "aiServerBaseUrl", "http://127.0.0.1:8000");
    }

    @Test
    void getAnalysisReturnsRedisCachedReportWhenPresent() throws Exception {
        AiAnalysisResponse cachedResponse = createSampleResponse();
        String cacheKey = RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(cacheKey)).thenReturn(objectMapper.writeValueAsString(cachedResponse));

        AiAnalysisResponse response = aiAnalysisService.getAnalysis(1L, 2026, 3);

        assertThat(response.getCluster().getName()).isEqualTo("사무·서적형");
        assertThat(response.getSummary().getTotalSavable()).isEqualTo(29258L);
        verifyNoInteractions(userRepository, transactionRepository, aiRestTemplate);
    }

    @Test
    void getAnalysisThrowsWhenRollingWindowHasNoTransactions() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3")).thenReturn(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(transactionRepository.existsByUser_IdAndTransactionAtBetween(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(false);

        assertThatThrownBy(() -> aiAnalysisService.getAnalysis(1L, 2026, 3))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("최근 3개월 거래가 없어 AI 리포트를 생성할 수 없습니다.");

        verify(transactionRepository, never()).findCategoryAmountSummariesByUserIdAndRange(any(), any(), any());
        verify(aiRestTemplate, never()).exchange(any(String.class), any(), any(), eq(AiAnalysisResponse.class));
    }

    @Test
    void getAnalysisThrowsFriendlyMessageWhenAiServerConnectionFails() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3")).thenReturn(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(transactionRepository.existsByUser_IdAndTransactionAtBetween(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(true);
        when(transactionRepository.findCategoryAmountSummariesByUserIdAndRange(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(createSummary("커피/음료", 233500, 12L)));
        when(aiRestTemplate.exchange(any(String.class), any(), any(), eq(AiAnalysisResponse.class)))
                .thenThrow(new ResourceAccessException("timeout"));

        assertThatThrownBy(() -> aiAnalysisService.getAnalysis(1L, 2026, 3))
                .isInstanceOf(InternalServerException.class)
                .hasMessageContaining("AI 리포트 서버 연결에 실패했습니다.");

        verify(aiAnalysisRepository, never()).save(any(AiAnalysis.class));
    }

    @Test
    void getAnalysisPersistsMinimalSnapshotAndCachesFullResponse() {
        AiAnalysisResponse aiResponse = createSampleResponse();
        User user = createUser();
        SpendingType spendingType = SpendingType.builder()
                .id(1L)
                .name("사무·서적형")
                .iconCode("book")
                .summary("학습 집중형")
                .build();
        ExpenseCategory expenseCategory = ExpenseCategory.builder()
                .id(1)
                .categoryName("커피/음료")
                .categoryIcon("☕")
                .build();
        AiAnalysis savedAnalysis = AiAnalysis.builder()
                .id(10L)
                .user(user)
                .spendingType(spendingType)
                .year(2026)
                .month(3)
                .analysisType(AiAnalysisType.MONTHLY)
                .description("사무/교육용품과 서적/도서 비중이 높은 학습 집중형 유형입니다.")
                .build();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3")).thenReturn(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(transactionRepository.existsByUser_IdAndTransactionAtBetween(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(true);
        when(transactionRepository.findCategoryAmountSummariesByUserIdAndRange(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(createSummary("커피/음료", 233500, 12L)));
        when(aiRestTemplate.exchange(any(String.class), any(), any(), eq(AiAnalysisResponse.class)))
                .thenReturn(ResponseEntity.ok(aiResponse));
        when(spendingTypeRepository.findById(1L)).thenReturn(Optional.of(spendingType));
        when(aiAnalysisRepository.save(any(AiAnalysis.class))).thenReturn(savedAnalysis);
        when(expenseCategoryRepository.findByCategoryName("커피/음료")).thenReturn(Optional.of(expenseCategory));

        AiAnalysisResponse response = aiAnalysisService.getAnalysis(1L, 2026, 3);

        assertThat(response.getGoal().getActionTip()).isEqualTo("커피/음료 구매 횟수를 주 3회 이내로 제한해보세요.");
        verify(aiAnalysisRepository).deleteByUser_IdAndYearAndMonthAndAnalysisType(1L, 2026, 3, AiAnalysisType.MONTHLY);
        verify(aiAnalysisRepository).save(any(AiAnalysis.class));

        ArgumentCaptor<List<AiAnalysisCategoryResult>> categoryCaptor = ArgumentCaptor.forClass(List.class);
        verify(aiAnalysisCategoryResultRepository).saveAll(categoryCaptor.capture());
        assertThat(categoryCaptor.getValue()).hasSize(1);
        assertThat(categoryCaptor.getValue().getFirst().getPrice()).isEqualTo(233500);

        verify(valueOperations).set(
                eq(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3"),
                any(String.class),
                eq(Duration.ofHours(6))
        );
    }

    @Test
    void evictMonthlyAiReportCachesRemovesChangedMonthAndNextTwoMonths() {
        aiAnalysisService.evictMonthlyAiReportCaches(
                1L,
                List.of(LocalDate.of(2026, 3, 15), LocalDate.of(2026, 3, 28))
        );

        verify(aiAnalysisRepository).deleteByUser_IdAndYearAndMonthAndAnalysisType(1L, 2026, 3, AiAnalysisType.MONTHLY);
        verify(aiAnalysisRepository).deleteByUser_IdAndYearAndMonthAndAnalysisType(1L, 2026, 4, AiAnalysisType.MONTHLY);
        verify(aiAnalysisRepository).deleteByUser_IdAndYearAndMonthAndAnalysisType(1L, 2026, 5, AiAnalysisType.MONTHLY);
        verify(redisTemplate).delete(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:3");
        verify(redisTemplate).delete(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:4");
        verify(redisTemplate).delete(RedisKeys.AI_MONTHLY_REPORT_PREFIX + "1:2026:5");
    }

    private User createUser() {
        return User.builder()
                .id(1L)
                .userId("wowuser")
                .name("테스터")
                .gender("M")
                .role(Role.USER)
                .build();
    }

    private TransactionRepository.CategoryAmountSummary createSummary(String categoryName, int amount, long count) {
        return new TransactionRepository.CategoryAmountSummary() {
            @Override
            public Integer getCategoryId() {
                return 1;
            }

            @Override
            public String getCategoryName() {
                return categoryName;
            }

            @Override
            public String getCategoryIcon() {
                return "☕";
            }

            @Override
            public BigDecimal getTotalAmount() {
                return BigDecimal.valueOf(amount);
            }

            @Override
            public Long getTransactionCount() {
                return count;
            }
        };
    }

    private AiAnalysisResponse createSampleResponse() {
        return AiAnalysisResponse.builder()
                .cluster(AiAnalysisResponse.Cluster.builder()
                        .id(1)
                        .name("사무·서적형")
                        .description("사무/교육용품과 서적/도서 비중이 높은 학습 집중형 유형입니다.")
                        .icon("📚")
                        .build())
                .categories(List.of(
                        AiAnalysisResponse.Category.builder()
                                .name("커피/음료")
                                .amount(233500L)
                                .myRatio(23.3)
                                .baseRatio(8.9)
                                .diff(14.4)
                                .build()
                ))
                .overspending(List.of(
                        AiAnalysisResponse.Overspending.builder()
                                .name("커피/음료")
                                .myRatio(23.3)
                                .baseRatio(8.9)
                                .savableAmount(16322L)
                                .build()
                ))
                .summary(AiAnalysisResponse.Summary.builder()
                        .totalSavable(29258L)
                        .expectedSpending(970842L)
                        .build())
                .tips(List.of(
                        AiAnalysisResponse.Tip.builder()
                                .order(1)
                                .keyword("커피·간식")
                                .title("커피·간식 빈도를 먼저 줄여보세요")
                                .description("하루 1회처럼 횟수 기준을 먼저 정해두면 지출을 안정적으로 줄일 수 있습니다.")
                                .build()
                ))
                .goal(AiAnalysisResponse.Goal.builder()
                        .savableAmount(29258L)
                        .expectedSpending(970842L)
                        .actionTip("커피/음료 구매 횟수를 주 3회 이내로 제한해보세요.")
                        .build())
                .build();
    }
}
