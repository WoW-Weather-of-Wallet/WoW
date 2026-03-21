package com.wow.domain.calendar.controller;

import com.wow.domain.calendar.dto.FixedExpenseManageResponse;
import com.wow.domain.calendar.service.FixedExpenseService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
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
}