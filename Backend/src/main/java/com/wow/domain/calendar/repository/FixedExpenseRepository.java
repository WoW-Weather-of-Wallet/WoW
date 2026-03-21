package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.FixedExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {

    // 캘린더용 — 활성화된 것만
    List<FixedExpense> findByUser_IdAndIsEnableTrue(Long userId);

    // 관리페이지용 — 전체 (결제일 순 정렬)
    List<FixedExpense> findByUser_IdOrderByDueDayAsc(Long userId);
}
