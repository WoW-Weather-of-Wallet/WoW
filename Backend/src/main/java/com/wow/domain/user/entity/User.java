package com.wow.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.wow.domain.account.entity.Account;
import com.wow.domain.calendar.entity.Transaction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "users")
// [added] 이유: DTO 검증을 우회하는 저장 경로에서도 잘못된 성별 값 저장을 막기 위한 DB 레벨 방어
@org.hibernate.annotations.Check(constraints = "gender IN ('M', 'F')")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, length = 50)
    private String userId;

    @Column(name = "ssafy_oauth_id", unique = true, length = 50)
    private String ssafyOauthId;

    @JsonIgnore
    @Column
    private String pw;

    @Column(length = 10)
    private String name;

    @Column(length = 1)
    private String gender;

    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Role role;

    @Column(name = "alarm_enabled")
    private boolean alarmEnabled;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private List<UserTerm> userTerms = new ArrayList<>();

    // [added] 이유: DB 레벨 CASCADE가 누락된 환경에서도 사용자 삭제 시 계좌가 함께 정리되도록 JPA 레벨 안전장치 추가
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private List<Account> accounts = new ArrayList<>();

    // [added] 이유: DB 스키마 의존도를 낮추고 사용자 삭제 시 거래내역 정리 흐름을 JPA에서도 명시적으로 보장
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = jakarta.persistence.CascadeType.REMOVE, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    public void updateProfile(String name, String gender, LocalDate birthDate) {
        if (name != null) {
            this.name = name.trim();
        }
        if (gender != null) {
            this.gender = gender;
        }
        if (birthDate != null) {
            this.birthDate = birthDate;
        }
    }

    public void updatePw(String encodedPw) {
        this.pw = encodedPw;
    }

    public void updatePhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
