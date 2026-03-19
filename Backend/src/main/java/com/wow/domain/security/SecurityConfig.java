package com.wow.domain.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    // [added] 이유: 프로덕션 환경에서 Swagger UI가 인증 없이 공개되어 전체 API 스펙 노출 → 프로파일별 제어
    @Value("${app.swagger-public:true}")
    private boolean swaggerPublic;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                                    "/api/v1/auth/signup",
                                    "/api/v1/auth/login",
                                    "/api/v1/auth/sms/send",
                                    "/api/v1/auth/sms/verify",
                                    "/api/v1/auth/check-signup-identity",
                                    "/api/v1/auth/check-user-id",
                                    "/api/v1/auth/refresh",
                                    "/api/v1/auth/find/**",
                                    "/api/v1/terms",
                                    "/api/v1/calendar/transactions/csv",
                                    "/api/v1/calendar/transactions/csv/confirm"
                            ).permitAll()
                            .requestMatchers(
                                    "/sso/providers/ssafy/**"
                            ).permitAll();
                    // [fix] 수정 전: Swagger 무조건 permitAll | 이유: 프로덕션에서 전체 API 스펙 노출 → 설정값으로 제어
                    if (swaggerPublic) {
                        auth.requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint), UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

}
