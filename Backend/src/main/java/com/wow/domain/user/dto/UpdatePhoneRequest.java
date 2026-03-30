package com.wow.domain.user.dto;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdatePhoneRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;
}
