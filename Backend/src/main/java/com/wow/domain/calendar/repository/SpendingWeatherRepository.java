package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.SpendingWeather;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpendingWeatherRepository extends JpaRepository<SpendingWeather, Long> {

    Optional<SpendingWeather> findByWeatherName(String weatherName);
}
