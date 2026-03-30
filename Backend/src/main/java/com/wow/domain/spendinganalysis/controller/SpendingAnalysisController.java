package com.wow.domain.spendinganalysis.controller;

import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.spendinganalysis.dto.SpendingHalfYearlyResponse;
import com.wow.domain.spendinganalysis.dto.SpendingMonthlyCompareResponse;
import com.wow.domain.spendinganalysis.service.SpendingAnalysisService;
import com.wow.global.common.ApiResponse;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/spending")
public class SpendingAnalysisController {

    private final SpendingAnalysisService spendingAnalysisService;

    @Operation(summary = "6개월 소비 유형 분석 결과 조회")
    @GetMapping("/half-yearly")
    public ResponseEntity<ApiResponse<SpendingHalfYearlyResponse>> getHalfYearlySpendingAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("유효하지 않은 인증 정보입니다.");
        }

        SpendingHalfYearlyResponse response =
                spendingAnalysisService.getHalfYearlySpendingAnalysis(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(200, "6개월 소비 유형 분석 결과 조회 성공", response));
    }

    @Operation(summary = "이번 달 지난 달 소비 비교 조회")
    @GetMapping("/monthly/compare")
    public ResponseEntity<ApiResponse<SpendingMonthlyCompareResponse>> getMonthlySpendingCompare(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("유효하지 않은 인증 정보입니다.");
        }

        SpendingMonthlyCompareResponse response =
                spendingAnalysisService.getMonthlySpendingCompare(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(200, "이번 달 지난 달 소비 비교 조회 성공", response));
    }
}
