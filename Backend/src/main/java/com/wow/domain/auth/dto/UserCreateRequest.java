package com.wow.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserCreateRequest {

    private String userId;
    private Long jobId;
    private String pw;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private boolean alarmEnabled;

}
