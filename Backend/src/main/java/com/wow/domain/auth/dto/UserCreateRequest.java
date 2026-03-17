package com.wow.domain.auth.dto;

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

    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9]{4,20}$", message = "아이디는 영문 소문자 필수 포함, 영문 소문자와 숫자만 사용 가능하며 특수문자는 사용 불가, 4자 이상 20자 이하여야 합니다.")
    private String userId;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String pw;

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 10, message = "이름은 10자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

    @AssertTrue(message = "필수 약관에 동의해야 합니다.")
    private boolean termsAgreed;

    private boolean alarmEnabled;

}
