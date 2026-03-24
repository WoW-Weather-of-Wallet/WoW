package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.*;
import com.wow.domain.calendar.service.FixedExpenseService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/fixed-expenses")
@RequiredArgsConstructor
public class FixedExpenseController {

    private final FixedExpenseService fixedExpenseService;

    // 고정지출 관리페이지 전체 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<FixedExpenseManageResponse>> getFixedExpenseManage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {

        Long userId = userDetails.getId();

        FixedExpenseManageResponse response =
                fixedExpenseService.getFixedExpenseManage(userId, year, month);

        return ResponseEntity.ok(
                ApiResponse.success(200, "고정지출 목록 조회 성공", response));
    }

    // 고정지출 항목 추가 (거래내역에서 선택)
    @PostMapping("/from-transaction")
    public ResponseEntity<ApiResponse<FixedExpenseAddResponse>> addFixedExpense(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody FixedExpenseAddRequest request) {

        Long userId = userDetails.getId();

        FixedExpenseAddResponse response =
                fixedExpenseService.addFixedExpense(userId, request);

        return ResponseEntity
                .status(201)
                .body(ApiResponse.success(201, "고정지출 추가 성공", response));
    }

    // 고정지출 수정 (아이콘, 금액, 결제일만 변경 가능)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<FixedExpenseUpdateResponse>> updateFixedExpense(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody FixedExpenseUpdateRequest request) {

        Long userId = userDetails.getId();

        FixedExpenseUpdateResponse response =
                fixedExpenseService.updateFixedExpense(userId, id, request);

        return ResponseEntity.ok(
                ApiResponse.success(200, "고정지출 수정 성공", response));
    }

    // 고정지출 항목 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFixedExpense(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        Long userId = userDetails.getId();
        fixedExpenseService.deleteFixedExpense(userId, id);

        return ResponseEntity.ok(
                ApiResponse.success(200, "고정지출 삭제 성공", null));
    }

    // 고정지출 활성화/비활성화
    @PatchMapping("/{id}/enable")
    public ResponseEntity<ApiResponse<FixedExpenseEnableResponse>> updateFixedExpenseEnable(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody FixedExpenseEnableRequest request) {

        Long userId = userDetails.getId();

        FixedExpenseEnableResponse response =
                fixedExpenseService.updateFixedExpenseEnable(userId, id, request);

        return ResponseEntity.ok(
                ApiResponse.success(200, "고정지출 활성화 상태 변경 성공", response));
    }
}