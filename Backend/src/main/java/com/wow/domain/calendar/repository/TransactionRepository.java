package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    interface CategoryAmountSummary {
        Integer getCategoryId();
        String getCategoryName();
        String getCategoryIcon();
        BigDecimal getTotalAmount();
        Long getTransactionCount();
    }

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

    boolean existsByUser_IdAndMerchantNameAndTransactionAtBetween(
            Long userId, String merchantName,
            LocalDateTime start, LocalDateTime end);

    List<Transaction> findByUser_IdAndTransactionAtBetweenOrderByTransactionAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    void deleteByUser_IdAndPaymentTypeAndTransactionAtBetween(
            Long userId, String paymentType,
            LocalDateTime start, LocalDateTime end);

    @Query("""
        select t.id
        from Transaction t
        where t.user.id = :userId
          and t.paymentType = :paymentType
          and t.transactionAt >= :start
          and t.transactionAt < :end
        """)
    List<Long> findIdsByUserIdAndPaymentTypeAndTransactionAtBetween(
            @Param("userId") Long userId,
            @Param("paymentType") String paymentType,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
        select
          c.id as categoryId,
          c.categoryName as categoryName,
          c.categoryIcon as categoryIcon,
          coalesce(sum(t.amount), 0) as totalAmount,
          count(t.id) as transactionCount
        from Transaction t
        join t.category c
        where t.user.id = :userId
          and t.transactionAt >= :start
          and t.transactionAt < :end
        group by c.id, c.categoryName, c.categoryIcon
        order by coalesce(sum(t.amount), 0) desc, c.id asc
        """)
    List<CategoryAmountSummary> findCategoryAmountSummariesByUserIdAndRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
