package com.wow.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TokenRefreshRequest {
    /*
     * 수정 이유:
     * - refresh token이 null/빈 문자열이어도 서비스까지 전달되던 상태였습니다.
     * - 잘못된 요청은 DTO 검증 단계에서 바로 차단하도록 @NotBlank를 추가했습니다.
     *
     * 수정 전 코드:
     * - private String refreshToken;
     */
    @NotBlank(message = "refresh token을 입력해주세요.")
    private String refreshToken;

}
