package com.wow.domain.auth.dto.ssafy;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.AssertTrue;
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

    // [fix] 수정 전: @Email private String ssafyOauthId | 이유: ssafyOauthId가 딥링크에 노출되어 클라이언트가 위조 가능 → opaque pending token으로 변경
    @NotBlank(message = "인증 토큰을 입력해주세요.")
    private String pendingToken;

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
