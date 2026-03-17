package com.wow.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserIdCheckResponse {

    /*
     * 수정 이유:
     * - boolean 필드명이 isAvailable일 때 Jackson이 JSON key를 available로 직렬화할 수 있어,
     *   프론트가 기대하는 isAvailable 계약과 어긋날 수 있습니다.
     *
     * 수정 전 코드:
     * - private boolean isAvailable;
     */
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private String message;
    private String userId;
}
