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
