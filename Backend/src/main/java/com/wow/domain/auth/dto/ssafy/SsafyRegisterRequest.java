package com.wow.domain.auth.dto.ssafy;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.AssertTrue;
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
public class SsafyRegisterRequest {

    @NotBlank(message = "SSAFY 계정을 입력해주세요.")
    /*
     * 수정 이유:
     * - SSAFY 회원은 이메일 형식의 OAuth 식별자를 사용한다는 정책을 DTO에서 강제합니다.
     * - 일반 회원 userId와 SSAFY OAuth 식별자를 더 분명히 구분합니다.
     *
     * 수정 전 코드:
     * - @NotBlank만 있어 이메일 형식이 아닌 값도 통과할 수 있었습니다.
     */
    @Email(message = "SSAFY 계정은 이메일 형식이어야 합니다.")
    private String ssafyOauthId;

    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.GENDER, message = "성별은 M 또는 F만 가능합니다.")
    private String gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 과거 날짜만 가능합니다.")
    private LocalDate birthDate;

    @AssertTrue(message = "약관에 동의해야 합니다.")
    private boolean termsAgreed;

    private boolean alarmEnabled;
}
