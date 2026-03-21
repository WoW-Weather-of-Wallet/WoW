package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.FixedExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {

    List<FixedExpense> findByUser_IdAndIsActiveTrue(Long userId);
}