package com.wow.domain.user.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 10, message = "이름은 10자 이하여야 합니다.")
    private String name;

    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

}
