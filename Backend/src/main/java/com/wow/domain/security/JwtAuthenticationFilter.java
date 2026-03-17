package com.wow.domain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        // 토큰이 존재하며 유효한 토큰인 경우
        if (token != null && jwtTokenProvider.validateToken(token)) {

            try {
                // 토큰으로 Authentication (사용자 인증 정보) 객체 생성
                Authentication authentication = jwtTokenProvider.getAuthentication(token);

                // 사용자 인증 정보 저장
                // 이후 @AuthenticationPrincipal이나
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (UsernameNotFoundException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "존재하지 않는 사용자입니다.");
                return;
            }

        }

        // filter chain의 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }

    // HTTP request header에서 JWT Token 추출
    private String resolveToken(HttpServletRequest request) {

        // Authorization header에서 값 추출
        String bearer = request.getHeader("Authorization");

        // 전달된 값이 없거나 공백인 경우
        if (bearer == null || bearer.isBlank()) {
            return null;
        }

        // 정상 요청인 경우 토큰 추출
        if (bearer.startsWith("Bearer ")) {
            return bearer.substring(7).trim();
        }

        // 잘못된 형식의 요청인 경우
        return null;
    }

}
