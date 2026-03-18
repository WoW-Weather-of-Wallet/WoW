package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.CalendarHeaderResponse;
import com.wow.domain.calendar.dto.TransactionConfirmDto;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.global.common.ApiResponse; // ApiResponse 위치는 프로젝트에 맞게 수정하세요
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
            @RequestParam int year,
            @RequestParam int month
            // @AuthenticationPrincipal CustomUserDetails userDetails // Security 연동 시 추가
    ) {
        // 임시로 userId 1L 전달 (나중에 토큰에서 가져오도록 수정)
        CalendarHeaderResponse response = calendarService.getCalendarHeader(1L, year, month);
        return ResponseEntity.ok(response);
    }

    // ① 파일 업로드 + 전처리 + 분류
    @PostMapping("/transactions/csv")
    public ResponseEntity<?> uploadTransactions(
            @RequestPart(value = "bank_file", required = false) MultipartFile bankFile,
            @RequestPart(value = "card_file", required = false) MultipartFile cardFile
    ) throws Exception {
        return ResponseEntity.ok(calendarService.preprocessTransactions(bankFile, cardFile));
    }

    // ⑤ 미분류 항목 재분류 저장
    @PostMapping("/transactions/overrides")
    public ResponseEntity<?> saveOverrides(
            @RequestBody Map<String, Object> body
    ) {
        List<Map<String, String>> rows = (List<Map<String, String>>) body.get("rows");
        calendarService.saveOverrides(rows);
        return ResponseEntity.ok("재분류 저장 완료");
    }

    // ⑦ 최종 확정 후 DB 저장
    @PostMapping("/transactions/confirm")
    public ResponseEntity<?> confirmTransactions(
            @RequestBody List<TransactionConfirmDto> items
    ) {
        calendarService.confirmTransactions(items);
        return ResponseEntity.ok("저장 완료");
    }
}