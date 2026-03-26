package com.wow.domain.budget.service;

import com.wow.domain.budget.dto.BudgetCreateRequest;
import com.wow.domain.budget.dto.BudgetCreateResponse;
import com.wow.domain.budget.dto.BudgetGetResponse;
import com.wow.domain.budget.entity.BudgetGoal;
import com.wow.domain.budget.repository.BudgetGoalRepository;
import com.wow.domain.calendar.repository.TransactionRepository;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.NotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private static final DateTimeFormatter BUDGET_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final BudgetGoalRepository budgetGoalRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public BudgetGetResponse getCurrentMonthBudget(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate currentMonthDate = currentMonth.atDay(1);

        int totalSpent = calculateTotalSpent(userId, currentMonth);
        int remainingDays = calculateRemainingDays(LocalDate.now(), currentMonth);
        int savedAmount = calculateCurrentMonthSavedAmount(userId, currentMonth);

        BudgetGoal budgetGoal = budgetGoalRepository.findByUser_IdAndBudgetDate(userId, currentMonthDate)
                .orElse(null);

        // 예산 미설정은 정상 시나리오: 예외 대신 기본값으로 응답
        if (budgetGoal == null) {
            return new BudgetGetResponse(
                    0,
                    totalSpent,
                    0,
                    0,
                    remainingDays,
                    0,
                    savedAmount
            );
        }

        int goalAmount = budgetGoal.getAmount();
        int remainingAmount = goalAmount - totalSpent;
        int usagePercentage = calculateUsagePercentage(totalSpent, goalAmount);
        int dailyAvailable = remainingDays > 0 ? remainingAmount / remainingDays : 0;

        return new BudgetGetResponse(
                goalAmount,
                totalSpent,
                remainingAmount,
                usagePercentage,
                remainingDays,
                dailyAvailable,
                savedAmount
        );
    }

    @Transactional
    public BudgetCreateResponse createCurrentMonthBudget(Long userId, BudgetCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        LocalDate currentMonth = YearMonth.now().atDay(1);

        if (budgetGoalRepository.existsByUser_IdAndBudgetDate(userId, currentMonth)) {
            throw new DuplicateException("이번 달 예산이 이미 설정되어 있습니다.");
        }

        BudgetGoal budgetGoal = BudgetGoal.builder()
                .user(user)
                .amount(request.getAmount())
                .budgetDate(currentMonth)
                .build();

        BudgetGoal savedBudgetGoal = budgetGoalRepository.save(budgetGoal);

        return new BudgetCreateResponse(
                savedBudgetGoal.getId(),
                savedBudgetGoal.getAmount(),
                savedBudgetGoal.getBudgetDate().format(BUDGET_MONTH_FORMATTER)
        );
    }

    private int calculateTotalSpent(Long userId, YearMonth targetMonth) {
        LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
        LocalDateTime end = targetMonth.plusMonths(1).atDay(1).atStartOfDay();
        return toAmount(transactionRepository.sumAmountByUserAndRange(userId, start, end));
    }

    private int calculateUsagePercentage(int totalSpent, int goalAmount) {
        if (goalAmount <= 0) {
            return 0;
        }
        return (int) ((long) totalSpent * 100 / goalAmount);
    }

    private int calculateRemainingDays(LocalDate today, YearMonth targetMonth) {
        YearMonth todayMonth = YearMonth.from(today);
        if (todayMonth.isBefore(targetMonth)) {
            return targetMonth.lengthOfMonth();
        }
        if (todayMonth.isAfter(targetMonth)) {
            return 0;
        }
        return Math.max(0, targetMonth.lengthOfMonth() - today.getDayOfMonth());
    }

    // 캘린더 헤더 절약금액과 동일한 계산식: 지난달 동기간 소비 - 이번달 동기간 소비
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
                userId,
                currentMonthStart,
                currentMonthToDateEndExclusive
        );
        BigDecimal previousMonthToDate = transactionRepository.sumAmountByUserAndRange(
                userId,
                previousMonthStart,
                previousMonthToDateEndExclusive
        );

        return previousMonthToDate.subtract(currentMonthToDate).intValue();
    }

    private int toAmount(BigDecimal amount) {
        return normalizeAmount(amount).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}