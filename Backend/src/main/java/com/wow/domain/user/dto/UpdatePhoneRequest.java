package com.wow.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdatePhoneRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;

}
