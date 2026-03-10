package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;
import tools.jackson.databind.PropertyNamingStrategies;
import tools.jackson.databind.annotation.JsonNaming;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SsafyTokenResponse {

    private String tokenType;       // bearer 고정
    private String accessToken;     // SSAFY 액세스 토큰
    private String scope;
    private String expiresIn;
    private String refreshToken;
    private Integer refreshTokenExpiresIn;
}
