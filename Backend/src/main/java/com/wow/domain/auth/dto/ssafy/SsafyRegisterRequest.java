package com.wow.domain.auth.dto.ssafy;

import jakarta.validation.constraints.AssertTrue;
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
    @AssertTrue(message = "약관에 동의해야 합니다.")
    private boolean termsAgreed;

}
