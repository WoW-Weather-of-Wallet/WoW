package com.wow.domain.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class FindIdRequest {

    private String name;
    private LocalDate birthDate;
    private String phoneNumber;

}
