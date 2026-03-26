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
            summary = "월별 AI 소비 리포트 조회",
            description = "기준 월을 포함한 최근 3개월 거래를 집계해 AI 소비 리포트를 생성합니다."
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
                                                  "name": "사무·서적형",
                                                  "description": "사무/교육용품과 서적/도서 비중이 높은 학습 집중형 유형입니다.",
                                                  "icon": "📚"
                                                },
                                                "categories": [
                                                  {
                                                    "name": "커피/음료",
                                                    "amount": 233500,
                                                    "my_ratio": 23.3,
                                                    "base_ratio": 8.9,
                                                    "diff": 14.4
                                                  }
                                                ],
                                                "overspending": [
                                                  {
                                                    "name": "커피/음료",
                                                    "my_ratio": 23.3,
                                                    "base_ratio": 8.9,
                                                    "savable_amount": 16322
                                                  }
                                                ],
                                                "summary": {
                                                  "total_savable": 29258,
                                                  "expected_spending": 970842
                                                },
                                                "tips": [
                                                  {
                                                    "order": 1,
                                                    "keyword": "커피·간식",
                                                    "title": "커피·간식 빈도를 먼저 줄여보세요",
                                                    "description": "하루 1회처럼 횟수 기준을 먼저 정해두면 지출을 안정적으로 줄일 수 있습니다."
                                                  }
                                                ],
                                                "goal": {
                                                  "savable_amount": 29258,
                                                  "expected_spending": 970842,
                                                  "action_tip": "커피/음료 구매 횟수를 주 3회 이내로 제한해보세요."
                                                }
                                              }
                                            }
                                            """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "최근 3개월 거래가 없어 리포트를 만들 수 없음",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "notFound",
                                    value = """
                                            {
                                              "httpStatusCode": 404,
                                              "errorMessage": "최근 3개월 거래가 없어 AI 리포트를 생성할 수 없습니다."
                                            }
                                            """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "500",
                    description = "AI 서버 연결 실패 또는 응답 처리 오류",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    name = "aiServerError",
                                    value = """
                                            {
                                              "httpStatusCode": 500,
                                              "errorMessage": "AI 리포트 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
                                            }
                                            """
                            )
                    )
            )
    })
    @GetMapping("/analysis")
    public ResponseEntity<ApiResponse<AiAnalysisResponse>> getAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "조회 대상 연도입니다. 생략하면 현재 서버 연도를 사용합니다.")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "조회 대상 월입니다. 생략하면 현재 서버 월을 사용합니다.")
            @RequestParam(required = false) Integer month
    ) {
        if (userDetails == null) {
            throw new InvalidTokenException("인증 정보가 올바르지 않습니다.");
        }

        // 연/월이 생략되면 현재 월 리포트를 조회한다.
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();

        if (targetMonth < 1 || targetMonth > 12) {
            throw new BadRequestException("월은 1~12 범위로 입력해주세요.");
        }

        Long userId = userDetails.getId();
        AiAnalysisResponse response = aiAnalysisService.getAnalysis(userId, targetYear, targetMonth);

        return ResponseEntity.ok(ApiResponse.success(200, "AI 리포트 조회 성공", response));
    }
}
