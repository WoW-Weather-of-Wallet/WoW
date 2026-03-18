package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.Email;
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

    @NotBlank(message = "SSAFY 계정을 입력해주세요.")
    /*
     * 수정 이유:
     * - SSAFY 중복 확인 단계에서도 OAuth 식별자가 이메일 형식이라는 정책을 동일하게 강제합니다.
     * - check/register 요청 간 규칙 차이로 잘못된 식별자가 중간 단계에서 통과하지 않도록 맞춥니다.
     *
     * 수정 전 코드:
     * - @NotBlank만 있어 이메일 형식 검증이 없었습니다.
     */
    @Email(message = "SSAFY 계정은 이메일 형식이어야 합니다.")
    private String ssafyOauthId;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F만 가능합니다.")
    private String gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 과거 날짜만 가능합니다.")
    private LocalDate birthDate;

    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;
}
