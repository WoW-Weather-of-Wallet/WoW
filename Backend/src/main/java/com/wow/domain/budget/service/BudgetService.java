package com.wow.domain.budget.service;

import com.wow.domain.budget.dto.BudgetCreateRequest;
import com.wow.domain.budget.dto.BudgetCreateResponse;
import com.wow.domain.budget.entity.BudgetGoal;
import com.wow.domain.budget.repository.BudgetGoalRepository;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.UserRepository;
import com.wow.global.exception.DuplicateException;
import com.wow.global.exception.NotFoundException;
import java.time.LocalDate;
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
    private final UserRepository userRepository;

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
}
