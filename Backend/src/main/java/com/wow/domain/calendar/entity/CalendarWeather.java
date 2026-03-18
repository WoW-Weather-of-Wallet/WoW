package com.wow.domain.calendar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "calendar_weather")
public class CalendarWeather {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calendar_weather_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spending_weather_id", nullable = false)
    private SpendingWeather spendingWeather;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 100)
    private String description;

    @Column(name = "is_forecast", nullable = false, length = 80)
    private String isForecast;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
