package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.global.common.ApiResponse; // ApiResponse 위치는 프로젝트에 맞게 수정하세요
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/header")
    public ResponseEntity<CalendarHeaderResponse> getCalendarHeader(
            @RequestParam int year,
            @RequestParam int month
            // @AuthenticationPrincipal CustomUserDetails userDetails // Security 연동 시 추가
    ) {
        // 임시로 userId 1L 전달 (나중에 토큰에서 가져오도록 수정)
        CalendarHeaderResponse response = calendarService.getCalendarHeader(1L, year, month);
        return ResponseEntity.ok(response);
    }
}