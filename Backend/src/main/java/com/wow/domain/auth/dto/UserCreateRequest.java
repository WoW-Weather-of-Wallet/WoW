package com.wow.domain.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Pattern;
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
    private String pw;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    @AssertTrue(message = "필수 약관에 동의해야 합니다.")
    private boolean termsAgreed;
    private boolean alarmEnabled;

}
