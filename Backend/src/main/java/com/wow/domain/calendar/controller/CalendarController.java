package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

//    // ① 파일 업로드 + 전처리 + 분류
//    @PostMapping("/transactions/csv")
//    public ResponseEntity<FlaskPreprocessDto> uploadTransactions(
//            @RequestPart(value = "bank_file", required = false) MultipartFile bankFile,
//            @RequestPart(value = "card_file", required = false) MultipartFile cardFile
//    ) throws Exception {
//        return ResponseEntity.ok(calendarService.preprocessTransactions(bankFile, cardFile));
//    }
//
//    // ② 미분류 항목 재분류 저장
//    @PostMapping("/transactions/overrides")
//    public ResponseEntity<?> saveOverrides(
//            @RequestBody Map<String, Object> body
//    ) {
//        List<Map<String, String>> rows = (List<Map<String, String>>) body.get("rows");
//        calendarService.saveOverrides(rows);
//        return ResponseEntity.ok("재분류 저장 완료");
//    }
//
//    // ③ 최종 확정 후 DB 저장  ← API 명세서 경로로 수정
//    @PostMapping("/transactions/csv/confirm")
//    public ResponseEntity<?> confirmTransactions(
//            @RequestBody TransactionConfirmRequest request) {
//
//        // TODO: Security 연동 시 @AuthenticationPrincipal 에서 추출
//        Long userId = 1L;
//
//        TransactionConfirmResponse response =
//                calendarService.confirmTransactions(userId, request);
//
//        return ResponseEntity.status(201).body(Map.of(
//                "httpStatusCode", 201,
//                "responseMessage", "거래내역 저장 성공",
//                "data", response
//        ));
//    }

    // ① 파일 업로드 + 전처리
    @PostMapping("/transactions/csv")
    public ResponseEntity<FlaskPreprocessDto> uploadTransactions(
            @RequestPart(value = "bank_file", required = false) MultipartFile bankFile,
            @RequestPart(value = "card_file", required = false) MultipartFile cardFile
    ) throws Exception {
        return ResponseEntity.ok(calendarService.preprocessTransactions(bankFile, cardFile));
    }

    // ② 미분류 항목 재분류 저장
    @PostMapping("/transactions/overrides")
    public ResponseEntity<?> saveOverrides(@RequestBody Map<String, Object> body) {
        List<Map<String, String>> rows = (List<Map<String, String>>) body.get("rows");
        calendarService.saveOverrides(rows);
        return ResponseEntity.ok("재분류 저장 완료");
    }

    // ③ 최종 확정 후 DB 저장
//    @PostMapping("/transactions/csv/confirm")
//    public ResponseEntity<ApiResponse<TransactionConfirmResponse>> confirmTransactions(
//            @RequestBody TransactionConfirmRequest request) {
//
//        Long userId = 1L; // TODO: Security 연동 시 토큰에서 추출
//
//        TransactionConfirmResponse response =
//                calendarService.confirmTransactions(userId, request);
//
//        return ResponseEntity
//                .status(201)
//                .body(ApiResponse.success(201, "거래내역 저장 성공", response));
//    }
    // ③ 최종 확정 후 DB 저장
    @PostMapping("/transactions/csv/confirm")
    public ResponseEntity<ApiResponse<TransactionConfirmResponse>> confirmTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,  // ← 토큰에서 자동 추출
            @RequestBody TransactionConfirmRequest request) {

        Long userId = userDetails.getId();  // ← 하드코딩 제거

        TransactionConfirmResponse response =
                calendarService.confirmTransactions(userId, request);

        return ResponseEntity
                .status(201)
                .body(ApiResponse.success(201, "거래내역 저장 성공", response));
    }
}