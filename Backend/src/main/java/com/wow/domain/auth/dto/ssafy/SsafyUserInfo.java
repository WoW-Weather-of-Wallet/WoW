package com.wow.domain.auth.dto.ssafy;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SsafyUserInfo {

    private String userId;  // 사용자 고유 식별 ID → ssafy_oauth_id로 저장
    private String name;    // 필수 동의 시 제공

}
