package com.wow.domain.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.global.common.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthenticationEntryPointTest {

    private final JwtAuthenticationEntryPoint entryPoint = new JwtAuthenticationEntryPoint();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void commenceReturnsUnauthorizedErrorResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(
                request,
                response,
                new InsufficientAuthenticationException("unauthorized")
        );

        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getContentType()).isEqualTo("application/json;charset=UTF-8");
        assertThat(objectMapper.readTree(response.getContentAsString()))
                .isEqualTo(objectMapper.readTree(
                        objectMapper.writeValueAsString(
                                ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "인증이 필요하거나 유효하지 않은 토큰입니다.")
                        )
                ));
    }
}
