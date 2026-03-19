package com.wow.domain.user.dto;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 10, message = "이름은 10자 이하로 입력해야 합니다.")
    @Pattern(regexp = "^(?!\\s*$).+", message = "이름은 공백만 입력할 수 없습니다.")
    private String name;

    @Pattern(regexp = ValidationPatterns.GENDER, message = "성별은 M 또는 F만 입력할 수 있습니다.")
    private String gender;

    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;
}
