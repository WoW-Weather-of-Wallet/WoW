package com.wow.domain.calendar.entity;

import com.wow.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "calendar")
public class Calendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calendar_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spending_weather_id")
    private SpendingWeather spendingWeather;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false)
    private DayType dayType;

    @Column(name = "daily_total")
    private Long dailyTotal;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(length = 100)
    private String description;

    @Column(name = "is_forecast")
    private Boolean isForecast;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Calendar.java 엔티티에 추가
    public void updateMemo(String memo) {
        this.memo = memo;
    }

    // Calendar.java 엔티티에 추가
    public void updateDailySummary(BigDecimal dailyTotal, int transactionCount) {
        this.dailyTotal = dailyTotal != null ? dailyTotal.longValue() : null;
        this.transactionCount = transactionCount;
    }

    public void updateDayType(DayType dayType) {
        this.dayType = dayType;
    }
}
