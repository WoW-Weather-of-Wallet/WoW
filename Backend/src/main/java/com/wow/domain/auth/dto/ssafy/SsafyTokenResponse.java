package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Getter
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SsafyTokenResponse {

    private String tokenType;       // bearer 고정
    private String accessToken;     // SSAFY 액세스 토큰
    private String scope;
    // [fix] 수정 전: String expiresIn | 이유: refreshTokenExpiresIn은 Integer인데 expiresIn만 String → 타입 불일치, 역직렬화 오류 가능
    private Integer expiresIn;
    private String refreshToken;
    private Integer refreshTokenExpiresIn;
}
