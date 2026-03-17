package com.wow.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FindIdRequest {

    @NotBlank(message = "이름을 입력해주세요.")
    private String name;
    @NotNull(message = "생년월일을 입력해주세요.")
    private LocalDate birthDate;
    @NotBlank(message = "전화번호를 입력해주세요.")
    private String phoneNumber;

}
