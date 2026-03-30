package com.wow.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenRefreshResponse {

    /*
     * 수정 이유:
     * - refresh token rotation을 적용하려면 /refresh 응답에서 새 refresh token도 함께 내려줘야 합니다.
     *
     * 수정 전 코드:
     * - private String accessToken;
     * - private long expiresIn;
     */
    private String accessToken;
    private long expiresIn;
    private String refreshToken;
    private long refreshExpiresIn;

}
