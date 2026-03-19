package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // User 객체의 id 필드로 접근 → User_Id
    boolean existsByUser_IdAndTransactionAtBetween(
            Long userId, LocalDateTime start, LocalDateTime end);

    void deleteByUser_IdAndTransactionAtBetween(
            Long userId, LocalDateTime start, LocalDateTime end);}