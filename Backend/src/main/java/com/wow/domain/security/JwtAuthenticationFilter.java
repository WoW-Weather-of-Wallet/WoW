package com.wow.domain.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // [added] 이유: 인증 실패 감사 로깅
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    // [fix] 수정 전: validateToken(token) + getAuthentication(token)으로 JWT 이중 파싱 | 이유: 매 요청마다 불필요한 2회 파싱 → 성능 저하 및 DoS 증폭 벡터
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null) {
            try {
                // [fix] 수정 전: validateToken + getAuthentication 분리 호출 | 이유: parseAccessToken으로 단일 파싱 + type claim 검증으로 refresh 토큰 사용 차단
                Claims claims = jwtTokenProvider.parseAccessToken(token);
                Authentication authentication = jwtTokenProvider.getAuthentication(claims);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException | IllegalArgumentException e) {
                // [fix] 수정 전: 예외 무시 | 이유: 유효하지 않은 토큰 시도에 대한 감사 로깅 추가
                log.warn("JWT 인증 실패 [{}]: {}", request.getRequestURI(), e.getMessage());
                SecurityContextHolder.clearContext();
            } catch (UsernameNotFoundException e) {
                // [added] 이유: 유효한 JWT이지만 DB에 사용자가 없는 경우(계정 삭제/데이터 이상) 로깅
                log.warn("JWT 토큰의 사용자를 찾을 수 없음 [{}]: {}", request.getRequestURI(), e.getMessage());
                SecurityContextHolder.clearContext();
                jwtAuthenticationEntryPoint.commence(request, response, e);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer == null || bearer.isBlank()) {
            return null;
        }
        if (bearer.startsWith("Bearer ")) {
            return bearer.substring(7).trim();
        }
        return null;
    }

}
