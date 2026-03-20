package com.wow.domain.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.global.common.ErrorResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private FilterChain filterChain;

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint = new JwtAuthenticationEntryPoint();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    // [fix] 수정 전: validateToken(token) + getAuthentication(String token) | 이유: 필터가 parseAccessToken(token) + getAuthentication(Claims)로 변경됨
    @Test
    void doFilterSetsAuthenticationWhenTokenIsValid() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken("wowuser", null);
        Claims claims = Jwts.claims().build();

        request.addHeader("Authorization", "Bearer access-token");
        when(jwtTokenProvider.parseAccessToken("access-token")).thenReturn(claims);
        when(jwtTokenProvider.getAuthentication(claims)).thenReturn(authentication);

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
        verify(filterChain).doFilter(request, response);
    }

    // [fix] 수정 전: validateToken + getAuthentication(String) | 이유: parseAccessToken + getAuthentication(Claims)로 변경
    @Test
    void doFilterReturnsUnauthorizedErrorResponseWhenUserDoesNotExist() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        Claims claims = Jwts.claims().build();

        request.addHeader("Authorization", "Bearer access-token");
        when(jwtTokenProvider.parseAccessToken("access-token")).thenReturn(claims);
        when(jwtTokenProvider.getAuthentication(claims))
                .thenThrow(new UsernameNotFoundException("user not found"));

        filter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getContentType()).isEqualTo("application/json;charset=UTF-8");
        assertThat(objectMapper.readTree(response.getContentAsString()))
                .isEqualTo(objectMapper.readTree(
                        objectMapper.writeValueAsString(
                                ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "인증이 필요하거나 유효하지 않은 토큰입니다.")
                        )
                ));
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterContinuesWhenAuthorizationHeaderIsMissing() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterContinuesWhenAuthorizationHeaderDoesNotUseBearerScheme() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        request.addHeader("Authorization", "Token access-token");

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(jwtTokenProvider, never()).parseAccessToken("access-token");
        verify(filterChain).doFilter(request, response);
    }

    // [fix] 수정 전: validateToken(false) + verify(never()).getAuthentication(String) | 이유: parseAccessToken이 JwtException을 throw하는 방식으로 변경
    @Test
    void doFilterContinuesWithoutAuthenticationWhenTokenIsExpiredOrInvalid() throws Exception {
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, jwtAuthenticationEntryPoint);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        request.addHeader("Authorization", "Bearer expired-token");
        when(jwtTokenProvider.parseAccessToken("expired-token"))
                .thenThrow(new JwtException("expired or invalid token"));

        filter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getContentAsString()).isEmpty();
        verify(jwtTokenProvider).parseAccessToken("expired-token");
        verify(jwtTokenProvider, never()).getAuthentication(any(Claims.class));
        verify(filterChain).doFilter(request, response);
    }
}
