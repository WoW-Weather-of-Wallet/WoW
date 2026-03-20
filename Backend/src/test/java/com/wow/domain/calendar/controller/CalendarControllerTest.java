package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarControllerTest {

    @Mock
    private CalendarService calendarService;

    @Mock
    private CustomUserDetails userDetails;

    @InjectMocks
    private CalendarController calendarController;

    @Test
    void getCalendarHeaderThrowsWhenAuthenticationPrincipalIsNull() {
        assertThatThrownBy(() -> calendarController.getCalendarHeader(null, 2026, 3))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessage("인증이 필요하거나 유효하지 않은 토큰입니다.");
    }

    @Test
    void getCalendarHeaderThrowsWhenMonthIsOutOfRange() {
        assertThatThrownBy(() -> calendarController.getCalendarHeader(userDetails, 2026, 13))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("month는 1~12 범위여야 합니다.");
    }

    @Test
    void getCalendarHeaderReturnsServiceResponseWhenAuthenticationPrincipalExists() {
        Long userId = 1L;
        int year = 2026;
        int month = 3;

        CalendarHeaderResponse expected = CalendarHeaderResponse.builder()
                .yearMonth("2026-03")
                .weatherName("CLOUDY")
                .iconCode("cloudy")
                .description("desc")
                .savedAmount(10000)
                .build();

        when(userDetails.getId()).thenReturn(userId);
        when(calendarService.getCalendarHeader(userId, year, month)).thenReturn(expected);

        ResponseEntity<CalendarHeaderResponse> response =
                calendarController.getCalendarHeader(userDetails, year, month);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);

        verify(userDetails).getId();
        verify(calendarService).getCalendarHeader(userId, year, month);
    }
}
