package com.wow.domain.account.entity;

import com.wow.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// [added] 이유: Account 엔티티에 JPA Auditing이 적용되지 않아 createdAt이 수동 관리 → 다른 엔티티와 일관성 확보
// [fix] 수정 전: @jakarta.persistence.EntityListeners FQCN | 이유: Transaction.java 등 다른 엔티티와 import 방식으로 통일
@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "accounts")
@EntityListeners(AuditingEntityListener.class)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bank_code", length = 10)
    private String bankCode;

    @Column(name = "bank_name", length = 20)
    private String bankName;

    @Column(name = "account_number", nullable = false, unique = true, length = 50)
    private String accountNumber;

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(length = 30)
    private String status;

    // [fix] 수정 전: @Column만 (Auditing 미적용) | 이유: 다른 엔티티는 @CreatedDate 사용하는데 Account만 수동 → 일관성 확보
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
