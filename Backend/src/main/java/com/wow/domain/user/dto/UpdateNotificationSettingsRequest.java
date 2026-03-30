package com.wow.domain.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class UpdateNotificationSettingsRequest {

    @NotNull(message = "알림 설정 여부는 필수입니다.")
    private Boolean alarmEnabled;
}
