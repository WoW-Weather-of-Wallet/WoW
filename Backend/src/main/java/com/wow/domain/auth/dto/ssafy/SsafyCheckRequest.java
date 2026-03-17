package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SsafyCheckRequest {

    @NotBlank(message = "SSAFY 계정 정보가 없습니다.")
    private String ssafyOauthId;
    @NotBlank(message = "성별을 입력해주세요.")
    private String gender;
    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate;
    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;

}
