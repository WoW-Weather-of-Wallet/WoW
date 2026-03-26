package com.wow.domain.AI.controller;

import com.wow.domain.AI.dto.AiAnalysisResponse;
import com.wow.domain.AI.service.AiAnalysisService;
import com.wow.domain.security.CustomUserDetails;
import com.wow.global.common.ApiResponse;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    @Operation(
            summary = "AI 소비 리포트 조회",
            description = "기본적으로 이번 달에 보여줘야 하는 직전 달 리포트를 조회합니다. generateIfAbsent=true이면 해당 월 리포트가 없을 때 새로 생성합니다."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "AI 리포트 조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ApiResponse.class),
                            examples = @ExampleObject(
                                    name = "success",
                                    value = """
                                            {
                                              "httpStatusCode": 200,
                                              "responseMessage": "AI 리포트 조회 성공",
                                              "data": {
                                                "cluster": {
                                                  "id": 1,
                                                  "name": "절약형",
                                                  "description": "최근 소비 패턴을 기반으로 분석된 소비 유형입니다.",
                                                  "icon": "sparkles"
                                                }
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "생성된 리포트가 없거나 분석 가능한 거래가 없음"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "AI 서버 연결 실패 또는 응답 처리 오류"
            )
    })
    @GetMapping("/analysis")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "리포트 대상 연도입니다. 생략하면 직전 달 기준 연도를 사용합니다.")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "리포트 대상 월입니다. 생략하면 직전 달 기준 월을 사용합니다.")
            @RequestParam(required = false) Integer month,
            @Parameter(description = "true면 해당 월 리포트가 없을 때 새로 생성하고, false면 기존 리포트만 조회합니다.")
            @RequestParam(required = false, defaultValue = "false") boolean generateIfAbsent
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증 정보가 올바르지 않습니다.");
        }

        LocalDate defaultReportMonth = LocalDate.now().minusMonths(1);
        int targetYear = (year != null) ? year : defaultReportMonth.getYear();
        int targetMonth = (month != null) ? month : defaultReportMonth.getMonthValue();

        if (targetMonth < 1 || targetMonth > 12) {
            throw new BadRequestException("월은 1~12 범위로 입력해주세요.");
        }

        Long userId = userDetails.getId();
        AiAnalysisResponse response =
                aiAnalysisService.getAnalysis(userId, targetYear, targetMonth, generateIfAbsent);

        return ResponseEntity.ok(ApiResponse.success(200, "AI 리포트 조회 성공", response));
    }
}
