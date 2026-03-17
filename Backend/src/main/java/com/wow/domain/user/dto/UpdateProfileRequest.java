package com.wow.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    private String name;
    private String gender;
    private LocalDate birthDate;

}
