package com.wow.domain.security;

import com.wow.domain.user.entity.User;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

// [fix] 수정 전: User 엔티티 전체를 외부로 노출 | 이유: 비밀번호 해시를 포함한 민감한 필드 접근 가능성 제거
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getName() {
        return user.getName();
    }

    public String getUserId() {
        return user.getUserId();
    }

    public String getSsafyOauthId() {
        return user.getSsafyOauthId();
    }

    public String getPhoneNumber() {
        return user.getPhoneNumber();
    }

    public String getGender() {
        return user.getGender();
    }

    public LocalDate getBirthDate() {
        return user.getBirthDate();
    }

    public String getLoginIdentifier() {
        return user.getUserId() != null ? user.getUserId() : user.getSsafyOauthId();
    }

    public String getLoginType() {
        return user.getUserId() != null ? "GENERAL" : "SSAFY";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + user.getRole().name());
    }

    @Override
    public String getPassword() {
        return user.getPw();
    }

    @Override
    public String getUsername() {
        return getLoginIdentifier();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
