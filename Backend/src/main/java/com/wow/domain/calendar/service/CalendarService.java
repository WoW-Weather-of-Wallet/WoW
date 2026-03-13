package com.wow.domain.calendar.service;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {
    public CalendarHeaderResponse getCalendarHeader(Long uerId, int year, int month){
        return CalendarHeaderResponse.builder()
                .yearMonth(year + "-" + String.format("%02d", month))
                .weatherStatus("CLOUDY")
                .weatherIcon("cloudy")
                .weatherDescription("외식 지출 패턴 감지됨")
                .savedAmount(101000)
                .build();
    }
}
