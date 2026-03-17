package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SsafyCheckRequest {

    @NotBlank(message = "SSAFY 계정 정보가 없습니다.")
    private String ssafyOauthId;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

    /*
     * 수정 이유:
     * - 다른 전화번호 요청 DTO들과 동일하게 SSAFY 가입 여부 확인 요청도
     *   잘못된 전화번호 형식을 DTO 단계에서 막아야 합니다.
     *
     * 수정 전 코드:
     * - @NotBlank(message = "전화번호를 입력해주세요.")
     * - private String phoneNumber;
     */
    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;
}
