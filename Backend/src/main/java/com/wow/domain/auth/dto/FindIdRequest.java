package com.wow.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FindIdRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 10, message = "이름은 10자 이하여야 합니다.")
    private String name;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

    @NotBlank(message = "전화번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - 아이디 찾기에서 SSAFY 계정 여부를 알려주기로 한 정책이라면, 본인 확인 조건을 더 강하게 가져가는 편이 안전합니다.
     * - 기존 name/birthDate/phoneNumber 조합에 gender를 추가해 일치 조건을 강화했습니다.
     *
     * 수정 전 코드:
     * - private String phoneNumber;
     */
    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F로 입력해주세요.")
    private String gender;

    @NotBlank(message = "전화번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - 아이디 찾기에도 같은 휴대폰 번호 형식 규칙을 적용해 입력 방어를 맞췄습니다.
     *
     * 수정 전 코드:
     * - @NotBlank(...)
     * - private String phoneNumber;
     */
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

}
