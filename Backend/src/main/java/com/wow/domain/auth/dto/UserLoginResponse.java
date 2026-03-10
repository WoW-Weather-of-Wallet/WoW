package com.wow.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserLoginResponse {

    private String accessToken;
    private long expiresIn;
    private UserSummaryResponse user;

    public static UserLoginResponse of(String accessToken, long expiresIn, UserSummaryResponse user) {
        return new UserLoginResponse(accessToken, expiresIn, user);
    }

}
