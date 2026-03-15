package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SsafyRegisterRequest {

    private String ssafyOauthId;
    private String phoneNumber;

}
