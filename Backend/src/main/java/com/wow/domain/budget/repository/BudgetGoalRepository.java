package com.wow.domain.budget.repository;

import com.wow.domain.budget.entity.BudgetGoal;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetGoalRepository extends JpaRepository<BudgetGoal, Long> {

    boolean existsByUser_IdAndBudgetDate(Long userId, LocalDate budgetDate);

    Optional<BudgetGoal> findByUser_IdAndBudgetDate(Long userId, LocalDate budgetDate);
}
