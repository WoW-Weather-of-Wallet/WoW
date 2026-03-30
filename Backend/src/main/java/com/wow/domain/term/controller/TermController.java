package com.wow.domain.term.controller;

import com.wow.domain.term.dto.TermResponse;
import com.wow.domain.term.service.TermService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Terms", description = "약관 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/terms")
public class TermController {

    private final TermService termService;

    // [fix] 수정 전: ResponseEntity<ApiResponse<List<TermResponse>>> + ApiResponse.success() 래퍼 사용 | 이유: AuthController/UserController는 raw DTO 반환하는데 TermController만 ApiResponse 래퍼 사용 → 프론트엔드에서 두 가지 응답 형식 처리 필요 → 일관성을 위해 raw DTO로 통일
    @Operation(summary = "약관 목록 조회", description = "저장된 약관 정보를 조회하고 presigned URL을 반환합니다.")
    @GetMapping
    public ResponseEntity<List<TermResponse>> getTerms() {
        return ResponseEntity.ok(termService.getTerms());
    }
}
