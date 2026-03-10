package com.wow.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class OnboardingRequest {

    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private boolean alarmEnabled;

}
