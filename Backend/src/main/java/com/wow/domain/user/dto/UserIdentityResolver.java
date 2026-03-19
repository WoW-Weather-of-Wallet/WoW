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

    public static String resolveLoginType(User user) {
        if (user.getUserId() != null) {
            return "NORMAL";
        }
        if (user.getSsafyOauthId() != null) {
            return "SSAFY";
        }
        return null;
    }
}
