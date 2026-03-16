package com.wow.domain.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserCreateRequest {

    @Size(min = 4, max = 20, message = "아이디는 4자 이상 20자 이하여야 합니다.")
    private String userId;
    private String pw;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private boolean termsAgreed;
    private boolean alarmEnabled;

}
