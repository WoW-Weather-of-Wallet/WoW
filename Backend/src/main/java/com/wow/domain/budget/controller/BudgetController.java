package com.wow.domain.budget.controller;

import com.wow.domain.budget.dto.BudgetCreateRequest;
import com.wow.domain.budget.dto.BudgetCreateResponse;
import com.wow.domain.budget.dto.BudgetGetResponse;
import com.wow.domain.budget.service.BudgetService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Budget", description = "월 예산 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/budget")
public class BudgetController {

    private final BudgetService budgetService;

    @Operation(summary = "이번 달 예산 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<BudgetGetResponse>> getCurrentMonthBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("유효하지 않은 인증 정보입니다.");
        }

        BudgetGetResponse response = budgetService.getCurrentMonthBudget(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(200, "예산 조회 성공", response));
    }

    @Operation(summary = "이번 달 예산 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetCreateResponse>> createCurrentMonthBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BudgetCreateRequest request
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("유효하지 않은 인증 정보입니다.");
        }

        BudgetCreateResponse response = budgetService.createCurrentMonthBudget(userDetails.getId(), request);

        return ResponseEntity.status(201)
                .body(ApiResponse.success(201, "예산 생성 완료", response));
    }
}
