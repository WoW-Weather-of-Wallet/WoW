package com.wow.domain.auth.dto;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupIdentityCheckRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 10, message = "이름은 10자 이하여야 합니다.")
    private String name;

    @NotBlank(message = "성별을 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.GENDER, message = "성별은 M 또는 F만 가능합니다.")
    private String gender;

    @NotNull(message = "생년월일을 입력해주세요.")
    @Past(message = "생년월일은 과거 날짜만 가능합니다.")
    private LocalDate birthDate;

    @NotBlank(message = "휴대폰번호를 입력해주세요.")
    @Pattern(regexp = ValidationPatterns.PHONE_NUMBER, message = "휴대폰번호는 01012345678 또는 010-1234-5678 형식으로 입력해주세요.")
    private String phoneNumber;
}
