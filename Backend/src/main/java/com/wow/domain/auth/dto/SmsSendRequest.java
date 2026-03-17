package com.wow.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class SmsSendRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;

}
