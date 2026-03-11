package com.wow.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wow.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSummaryResponse {

    private String userId;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private String loginType;

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                resolveUserId(user),
                user.getName(),
                user.getGender(),
                user.getPhoneNumber(),
                user.getBirthDate(),
                resolveLoginType(user)
        );

    }

    private static String resolveUserId(User user) {
        if (user.getUserId() != null) return user.getUserId();
        return null;
    }

    private static String resolveLoginType(User user) {
        if (user.getUserId() != null) return "NORMAL";
        if (user.getSsafyOauthId() != null) return "SSAFY";
        return null;
    }

}
