package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ExchangeTokenRequest {

    @NotBlank(message = "인증 코드를 입력해주세요.")
    private String code;
}
