package com.wow.domain.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, length = 50)
    private String userId;

    @Column(name = "ssafy_oauth_id", unique = true, length = 50)
    private String ssafyOauthId;

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
    @Column(length = 5)
    private Role role;

    @Column(name = "alarm_enabled")
    private boolean alarmEnabled;

    public void updateProfile(String name, String gender, LocalDate birthDate) {
        if (name != null) this.name = name;
        if (gender != null) this.gender = gender;
        if (birthDate != null) this.birthDate = birthDate;
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
