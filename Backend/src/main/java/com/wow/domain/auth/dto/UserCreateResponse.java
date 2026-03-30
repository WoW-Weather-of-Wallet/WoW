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
public class UserCreateResponse {

    private String userId;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
    private boolean alarmEnabled;

    public static UserCreateResponse from(User user) {
        return new UserCreateResponse(
                user.getUserId(),
                user.getName(),
                user.getGender(),
                user.getPhoneNumber(),
                user.getBirthDate(),
                user.isAlarmEnabled()
        );
    }

}
