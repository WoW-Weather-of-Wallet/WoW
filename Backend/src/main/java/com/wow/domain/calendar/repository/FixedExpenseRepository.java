package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.FixedExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {

    // 캘린더용 — 활성화된 것만
    List<FixedExpense> findByUser_IdAndIsEnableTrue(Long userId);

    // 관리페이지용 — 전체 (결제일 순 정렬)
    List<FixedExpense> findByUser_IdOrderByDueDayAsc(Long userId);

    // 고정지출 추가
    boolean existsByTransaction_Id(Long transactionId);

    // 같은 유저의 동일 가맹점명 고정지출 중복 체크
    boolean existsByUser_IdAndName(Long userId, String name);
}
