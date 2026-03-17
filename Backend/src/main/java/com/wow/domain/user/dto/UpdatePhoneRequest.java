package com.wow.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdatePhoneRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - 기존에는 @NotBlank만 있어 형식이 잘못된 전화번호도 서비스까지 들어갈 수 있었습니다.
     * - 숫자만 입력하거나 하이픈을 포함한 휴대폰 번호 형식만 허용하도록 검증을 추가했습니다.
     *
     * 수정 전 코드:
     * - @NotBlank(...)
     * - private String phoneNumber;
     */
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

}
