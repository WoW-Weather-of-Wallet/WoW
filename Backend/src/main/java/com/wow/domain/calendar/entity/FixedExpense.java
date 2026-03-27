package com.wow.domain.calendar.entity;

import com.wow.domain.account.entity.Account;
import com.wow.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "fixed_expense")  // ← 테이블명 수정 (fixed_expenses → fixed_expense)
public class FixedExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(name = "icon", length = 10)
    private String icon;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "due_day", nullable = false)
    private Integer dueDay;

    @Column(name = "is_auto")
    private Boolean isAuto;

    @Column(name = "is_enable")  // ← is_active → is_enable 로 수정
    private Boolean isEnable;

    @Column(name = "payment_status", length = 20)
    private String paymentStatus;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // FixedExpense.java에 추가
    public void update(String icon, Integer amount, Integer dueDay) {
        if (icon != null) this.icon = icon;
        if (amount != null) this.amount = amount;
        if (dueDay != null) this.dueDay = dueDay;
    }

    // 토글(직접 입력 형식)
    public void updateEnable(Boolean isEnable) {
        this.isEnable = isEnable;
    }
}