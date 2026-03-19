package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.dto.TransactionConfirmDto;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/header")
    public ResponseEntity<CalendarHeaderResponse> getCalendarHeader(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요하거나 유효하지 않은 토큰입니다.");
        }

        if (month < 1 || month > 12) {
            throw new BadRequestException("month는 1~12 범위여야 합니다.");
        }

        Long userId = userDetails.getId();
        CalendarHeaderResponse response = calendarService.getCalendarHeader(userId, year, month);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/transactions/csv")
    public ResponseEntity<?> uploadTransactions(
            @RequestPart(value = "bank_file", required = false) MultipartFile bankFile,
            @RequestPart(value = "card_file", required = false) MultipartFile cardFile
    ) {
        return ResponseEntity.ok(calendarService.preprocessTransactions(bankFile, cardFile));
    }

    @PostMapping("/transactions/overrides")
    public ResponseEntity<?> saveOverrides(@RequestBody Map<String, Object> body) {
        List<Map<String, String>> rows = (List<Map<String, String>>) body.get("rows");
        calendarService.saveOverrides(rows);
        return ResponseEntity.ok("overrides saved");
    }

    @PostMapping("/transactions/confirm")
    public ResponseEntity<?> confirmTransactions(@RequestBody List<TransactionConfirmDto> items) {
        calendarService.confirmTransactions(items);
        return ResponseEntity.ok("transactions confirmed");
    }
}
