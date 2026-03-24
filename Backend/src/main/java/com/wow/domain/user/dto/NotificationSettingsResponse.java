package com.wow.domain.user.dto;

import com.wow.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class NotificationSettingsResponse {

    private boolean alarmEnabled;

    public static NotificationSettingsResponse from(User user) {
        return new NotificationSettingsResponse(user.isAlarmEnabled());
    }
}
