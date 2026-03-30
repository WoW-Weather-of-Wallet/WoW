package com.wow.domain.user.dto;

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
public class UserProfileResponse {

    private String userId;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private boolean alarmEnabled;
    private String loginType;

    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                UserIdentityResolver.resolveUserId(user),
                user.getName(),
                user.getGender(),
                user.getPhoneNumber(),
                user.getBirthDate(),
                user.isAlarmEnabled(),
                UserIdentityResolver.resolveLoginType(user)
        );
    }
}
