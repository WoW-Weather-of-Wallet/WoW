package com.wow.domain.calendar.repository;

import com.wow.domain.calendar.entity.Calendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalendarRepository extends JpaRepository<Calendar, Long> {

    @Query("""
            select c
            from Calendar c
            left join fetch c.spendingWeather sw
            where c.user.id = :userId
              and c.date = :date
            """)
    Optional<Calendar> findByUserIdAndDateWithWeather(
            @Param("userId") Long userId,
            @Param("date") LocalDate date
    );

    @Query("""
            select c
            from Calendar c
            left join fetch c.spendingWeather sw
            where c.user.id = :userId
              and c.date between :startDate and :endDate
            order by c.date asc
            """)
    List<Calendar> findMonthlyByUserIdWithWeather(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
