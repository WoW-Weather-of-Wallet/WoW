package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SsafyRegisterRequest {

    @NotBlank(message = "SSAFY 계정 정보가 없습니다.")
    private String ssafyOauthId;

    @NotBlank(message = "전화번호를 입력해주세요.")
    /*
     * 수정 이유:
     * - SSAFY 회원가입도 동일한 휴대폰 번호 형식 규칙을 사용하도록 맞췄습니다.
     *
     * 수정 전 코드:
     * - @NotBlank(...)
     * - private String phoneNumber;
     */
    @Pattern(regexp = "^01\\d-?\\d{3,4}-?\\d{4}$", message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

    @AssertTrue(message = "약관에 동의해야 합니다.")
    private boolean termsAgreed;

    private boolean alarmEnabled;

}
