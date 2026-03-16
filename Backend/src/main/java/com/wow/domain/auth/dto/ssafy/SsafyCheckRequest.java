package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SsafyCheckRequest {

    private String ssafyOauthId;
    private String gender;
    private LocalDate birthDate;
    private String phoneNumber;

}
