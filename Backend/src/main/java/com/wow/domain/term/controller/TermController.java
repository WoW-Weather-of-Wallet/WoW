package com.wow.domain.term.controller;

import com.wow.domain.term.dto.TermResponse;
import com.wow.domain.term.service.TermService;
import com.wow.global.common.ApiResponse;
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

    @Operation(summary = "약관 목록 조회", description = "저장된 약관 정보를 조회하고 presigned URL을 반환합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TermResponse>>> getTerms() {
        return ResponseEntity.ok(
                ApiResponse.success(200, "약관 목록 조회 성공", termService.getTerms())
        );
    }
}
