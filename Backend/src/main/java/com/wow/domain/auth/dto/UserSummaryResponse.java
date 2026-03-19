package com.wow.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.user.dto.UserIdentityResolver;
import com.wow.domain.user.entity.User;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
                UserIdentityResolver.resolveUserId(user),
                user.getName(),
                user.getGender(),
                user.getPhoneNumber(),
                user.getBirthDate(),
                UserIdentityResolver.resolveLoginType(user)
        );
    }

    // [added] 이유: CustomUserDetails가 User 엔티티 전체를 외부로 노출하지 않아도 로그인 응답 생성 가능하도록 보완
    // [주의] userId 필드에는 getLoginIdentifier() 값이 담김 — GENERAL 로그인이면 userId, SSAFY 로그인이면 ssafyOauthId
    public static UserSummaryResponse from(CustomUserDetails userDetails) {
        return new UserSummaryResponse(
                userDetails.getLoginIdentifier(),
                userDetails.getName(),
                userDetails.getGender(),
                userDetails.getPhoneNumber(),
                userDetails.getBirthDate(),
                userDetails.getLoginType()
        );
    }
}
