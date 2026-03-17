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

    /*
     * 수정 이유:
     * - 아이디 찾기에서 SSAFY 계정 여부를 알려주는 정책이라면, 본인 확인 강도를 높이기 위해
     *   기존 name/birthDate/phoneNumber 조합에 gender까지 같이 검증해야 합니다.
     *
     * 수정 전 코드:
     * - private String gender;
     */
    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F로 입력해주세요.")
    private String gender;

    /*
     * 수정 이유:
     * - 기존에는 전화번호용 @NotBlank가 주석 위에 있어 gender 필드에 잘못 적용될 수 있었습니다.
     * - phoneNumber 필드에 직접 어노테이션을 붙여 검증 대상과 메시지를 정확히 맞춥니다.
     *
     * 수정 전 코드:
     * - @NotBlank(message = "전화번호를 입력해주세요.")
     * - private String phoneNumber;
     */
    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;
}
