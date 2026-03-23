package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // User 객체의 id 필드로 접근 → User_Id
    boolean existsByUser_IdAndTransactionAtBetween(
            Long userId, LocalDateTime start, LocalDateTime end);
    @Query("""
            select coalesce(sum(t.amount), 0)
            from Transaction t
            where t.user.id = :userId
              and t.transactionAt >= :start
              and t.transactionAt < :end
            """)
    BigDecimal sumAmountByUserAndRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            select t
            from Transaction t
            join fetch t.category c
            where t.user.id = :userId
              and t.transactionAt >= :start
              and t.transactionAt < :end
            order by t.transactionAt asc, t.id asc
            """)
    List<Transaction> findDailyByUserIdWithCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    void deleteByUser_IdAndTransactionAtBetween(
            Long userId, LocalDateTime start, LocalDateTime end);

    // 고정지출 납부완료 확인용
    boolean existsByUser_IdAndMerchantNameAndTransactionAtBetween(
            Long userId, String merchantName,
            LocalDateTime start, LocalDateTime end);

    // 월별 거래내역 조회 (날짜 내림차순)
    List<Transaction> findByUser_IdAndTransactionAtBetweenOrderByTransactionAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

}
