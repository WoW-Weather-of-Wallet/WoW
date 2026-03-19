package com.wow.domain.auth.dto;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserCreateRequest {

    @Pattern(
            regexp = ValidationPatterns.USER_ID,
            message = "아이디는 영문 소문자와 숫자를 포함한 4자 이상 20자 이하만 사용할 수 있습니다."
    )
    /*
     * 수정 이유:
     * - @Pattern만 있으면 null을 통과하므로 @NotBlank를 추가했습니다.
     * - 일반 회원은 이메일 형식이 아닌 서비스용 아이디를 사용한다는 정책을 DTO에서 분명히 드러냅니다.
     *
     * 수정 전 코드:
     * - @Pattern(...)
     * - private String userId;
     */
    @NotBlank(message = "아이디를 입력해주세요.")
    private String userId;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String pw;

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 10, message = "이름은 10자 이하만 가능합니다.")
    private String name;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.GENDER, message = "성별은 M 또는 F만 가능합니다.")
    private String gender;

    @NotBlank(message = "전화번호를 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "전화번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 과거 날짜만 가능합니다.")
    private LocalDate birthDate;

    @AssertTrue(message = "약관에 동의해야 합니다.")
    private boolean termsAgreed;

    private boolean alarmEnabled;
}
