package com.wow.domain.expensecategory.repository;

import com.wow.domain.expensecategory.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Integer> {
}
