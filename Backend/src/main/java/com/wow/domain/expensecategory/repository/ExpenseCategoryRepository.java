package com.wow.domain.expensecategory.repository;

import com.wow.domain.expensecategory.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Integer> {

    Optional<ExpenseCategory> findByCategoryName(String categoryName);
}
