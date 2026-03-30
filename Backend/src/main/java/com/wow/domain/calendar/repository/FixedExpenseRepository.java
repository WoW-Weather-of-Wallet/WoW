package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.FixedExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {

    // 캘린더용 — 활성화된 것만
    List<FixedExpense> findByUser_IdAndIsEnableTrue(Long userId);

    // 관리페이지용 — 전체 (결제일 순 정렬)
    List<FixedExpense> findByUser_IdOrderByDueDayAsc(Long userId);

    // 고정지출 추가
    boolean existsByTransaction_Id(Long transactionId);

    // 같은 유저의 동일 가맹점명 고정지출 중복 체크
    boolean existsByUser_IdAndName(Long userId, String name);

    // 거래내역 핀 표시용 — 유저의 고정지출 가맹점명 목록 조회
    @Query("SELECT fe.name FROM FixedExpense fe WHERE fe.user.id = :userId")
    Set<String> findNamesByUserId(@Param("userId") Long userId);

    // 고정지출에 연결된 transaction_id Set 조회
    @Query("SELECT fe.transaction.id FROM FixedExpense fe WHERE fe.user.id = :userId AND fe.transaction IS NOT NULL")
    Set<Long> findTransactionIdsByUserId(@Param("userId") Long userId);
}
