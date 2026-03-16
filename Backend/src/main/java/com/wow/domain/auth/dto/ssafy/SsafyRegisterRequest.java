package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class SsafyRegisterRequest {

    private String ssafyOauthId;
    private String phoneNumber;
    private String gender;
    private LocalDate birthDate;
    private boolean alarmEnabled;

}
