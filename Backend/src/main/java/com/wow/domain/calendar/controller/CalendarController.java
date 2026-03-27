package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.service.CalendarService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import com.wow.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @Operation(
            summary = "캘린더 헤더 조회",
            description = "캘린더 헤더로 오늘 날씨, 설명, 절약금액을 조회합니다."
    )
    @GetMapping("/header")
    public ResponseEntity<ApiResponse<CalendarHeaderResponse>> getCalendarHeader(
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
        return ResponseEntity.ok(ApiResponse.success(200, "캘린더 헤더 조회 성공", response));
    }

    @Operation(
            summary = "월별 캘린더 내역 조회",
            description = "현재 월에 해당하는 날짜별 날씨 정보 및 일별 지출 가격을 조회합니다."
    )
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<CalendarMonthlyResponse>>> getCalendarMonthly(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증 정보가 유효하지 않습니다.");
        }

        if (month < 1 || month > 12) {
            throw new BadRequestException("month는 1~12 범위여야 합니다.");
        }

        Long userId = userDetails.getId();
        List<CalendarMonthlyResponse> response = calendarService.getCalendarMonthly(userId, year, month);
        return ResponseEntity.ok(ApiResponse.success(200, "캘린더 조회 성공", response));
    }

    @Operation(
            summary = "일별 거래내역 조회",
            description = "선택한 날짜의 날씨, 지출 요약, 거래 내역, 메모를 조회합니다."
    )
    @GetMapping("/daily/transactions")
    public ResponseEntity<ApiResponse<CalendarDailyResponse>> getCalendarDaily(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요하거나 유효하지 않은 토큰입니다.");
        }

        Long userId = userDetails.getId();
        CalendarDailyResponse response = calendarService.getCalendarDaily(userId, date);
        return ResponseEntity.ok(ApiResponse.success(200, "일일 요약 조회 성공", response));
    }

    @PutMapping("/{date}/memo")
    public ResponseEntity<ApiResponse<CalendarMemoResponse>> upsertMemo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody CalendarMemoRequest request
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요하거나 유효하지 않은 토큰입니다.");
        }

        Long userId = userDetails.getId();
        CalendarMemoResponse response = calendarService.updateMemo(userId, date, request.getMemo());
        return ResponseEntity.ok(ApiResponse.success(200, "메모 입력 성공", response));
    }

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

    // ④ 거래내역 직접 입력 (다건)
    @PostMapping("/transactions/custom")
    public ResponseEntity<ApiResponse<TransactionCustomResponse>> createCustomTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransactionCustomRequest request) {

        Long userId = userDetails.getId();

        TransactionCustomResponse response =
                calendarService.createCustomTransaction(userId, request);

        return ResponseEntity
                .status(201)
                .body(ApiResponse.success(201, "거래내역 직접 입력 성공", response));
    }

    // ⑤ 고정지출 목록 조회
    @GetMapping("/fixed-expenses")
    public ResponseEntity<ApiResponse<FixedExpenseResponse>> getFixedExpenses(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {

        Long userId = userDetails.getId();

        FixedExpenseResponse response =
                calendarService.getFixedExpenses(userId, year, month);

        return ResponseEntity.ok(
                ApiResponse.success(200, "고정지출 목록 조회 성공", response));
    }

    // 전체 거래내역 조회
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<CalendarTransactionResponse>> getCalendarTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {

        Long userId = userDetails.getId();

        CalendarTransactionResponse response =
                calendarService.getCalendarTransactions(userId, year, month);

        return ResponseEntity.ok(
                ApiResponse.success(200, "전체 거래내역 조회 성공", response));
    }

    // 거래내역 삭제
    @DeleteMapping("/transactions/custom/{transactionId}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long transactionId) {

        Long userId = userDetails.getId();
        calendarService.deleteTransaction(userId, transactionId);

        return ResponseEntity.ok(
                ApiResponse.success(200, "거래내역 삭제 성공", null));
    }

    // 현금 거래내역 직접 입력
    @PostMapping("/transactions/custom/cash")
    public ResponseEntity<ApiResponse<TransactionCustomResponse>> createCashTransaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody TransactionCustomRequest request) {

        Long userId = userDetails.getId();

        TransactionCustomResponse response =
                calendarService.createCashTransaction(userId, request);

        return ResponseEntity
                .status(201)
                .body(ApiResponse.success(201, "현금 거래내역 입력 성공", response));
    }
}
