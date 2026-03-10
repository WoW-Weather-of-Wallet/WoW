package com.wow.domain.auth.dto;

import com.wow.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class UserSummaryResponse {

    private String userId;
    private String jobName;
    private String name;
    private String gender;
    private String phoneNumber;
    private LocalDate birthDate;
//    private boolean alarmEnabled;

    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getUserId(),
                user.getJob() != null ? user.getJob().getJobName() : null,
                user.getName(),
                user.getGender(),
                user.getPhoneNumber(),
                user.getBirthDate()
//                user.isAlarmEnabled()
        );
    }

}
