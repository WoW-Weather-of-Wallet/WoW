package com.wow.domain.AI.controller;

import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.AI.service.AiAnalysisService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    @Operation(
            summary = "AI 소비 분석 결과 조회",
            description = "사용자의 소비 패턴을 AI가 분석한 클러스터, 과소비 항목, 절감 목표, 개선 방향을 반환합니다."
    )
    @GetMapping("/analysis")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "Report target year. Defaults to the current server year.")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Report target month. Defaults to the current server month.")
            @RequestParam(required = false) Integer month
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증이 필요하거나 유효하지 않은 토큰입니다.");
        }

        // 기본값: 현재 연월
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();

        if (targetMonth < 1 || targetMonth > 12) {
            throw new BadRequestException("유효하지 않은 월입니다. (1~12)");
        }

        Long userId = userDetails.getId();
        AiAnalysisResponse response = aiAnalysisService.getAnalysis(userId, targetYear, targetMonth);

        return ResponseEntity.ok(ApiResponse.success(200, "AI 소비 분석 조회 성공", response));
    }
}
