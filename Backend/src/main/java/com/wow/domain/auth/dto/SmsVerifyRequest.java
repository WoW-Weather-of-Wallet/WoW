package com.wow.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class SmsVerifyRequest {

    @NotBlank(message = "전화번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - SMS 인증 확인 요청도 동일한 전화번호 형식 규칙을 사용하도록 맞췄습니다.
     *
     * 수정 전 코드:
     * - @NotBlank(...)
     * - private String phoneNumber;
     */
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

    @NotBlank(message = "인증번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - 인증번호는 생성 로직상 6자리 숫자이므로, DTO에서도 동일한 형식만 허용하는 편이 안전합니다.
     *
     * 수정 전 코드:
     * - @NotBlank(...)
     * - private String code;
     */
    @Pattern(regexp = "^\\d{6}$", message = "인증번호는 6자리 숫자로 입력해주세요.")
    private String code;

}
