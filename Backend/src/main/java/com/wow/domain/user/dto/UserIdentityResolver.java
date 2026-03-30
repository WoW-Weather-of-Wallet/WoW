package com.wow.domain.user.dto;

import com.wow.domain.user.entity.User;

public final class UserIdentityResolver {

    private UserIdentityResolver() {
    }

    public static String resolveUserId(User user) {
        if (user.getUserId() != null) {
            return user.getUserId();
        }
        return null;
    }

    // [fix] 수정 전: "NORMAL" 반환 | 이유: CustomUserDetails.getLoginType()이 "GENERAL"을 반환하므로 불일치 → "GENERAL"로 통일
    public static String resolveLoginType(User user) {
        if (user.getUserId() != null) {
            return "GENERAL";
        }
        if (user.getSsafyOauthId() != null) {
            return "SSAFY";
        }
        return null;
    }
}
