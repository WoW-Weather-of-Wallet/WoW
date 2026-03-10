package com.wow.domain.auth.service;

import com.wow.domain.auth.dto.*;
import com.wow.domain.security.CustomUserDetails;
import com.wow.domain.security.JwtTokenProvider;
import com.wow.domain.user.entity.Job;
import com.wow.domain.user.entity.Role;
import com.wow.domain.user.entity.User;
import com.wow.domain.user.repository.JobRepository;
import com.wow.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;


    public UserCreateResponse signup(UserCreateRequest request) {

        if (userRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 회원입니다.");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직업입니다."));

        User user = User.builder()
                .userId(request.getUserId())
                .job(job)
                .pw(bCryptPasswordEncoder.encode(request.getPw()))
                .name(request.getName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .birthDate(request.getBirthDate())
                .alarmEnabled(request.isAlarmEnabled())
                .role(Role.User)
                .build();

        return UserCreateResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserLoginResponse  login(UserLoginRequest request) {

        // 아이디 비밀번호 검증 후 사용자 인증 정보 객체 생성
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUserId(),
                        request.getPw()
                )
        );

        // 사용자 인증 정보 객체로 JWT 생성
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        String accessToken = jwtTokenProvider.createAccessToken(
                userDetails.getUsername(),
                userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList()
        );

        return UserLoginResponse.of(
                accessToken,
                jwtTokenProvider.getAccessTokenValidityInSeconds(),
                UserSummaryResponse.from(userDetails.getUser())
        );

    }

}
