package com.wow.domain.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.global.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        /*
         * 수정 이유:
         * - JWT 인증 진입점의 401 응답만 {"message": "..."} 형태로 내려가면,
         *   GlobalExceptionHandler의 ErrorResponse 구조와 달라 프론트가 별도 분기 처리해야 합니다.
         * - 인증 실패도 다른 예외 응답과 같은 형식으로 통일해 클라이언트 처리와 테스트 기준을 단순화합니다.
         *
         * 수정 전 코드:
         * - objectMapper.writeValueAsString(Map.of("message", "...")) 로 직접 JSON을 만들었습니다.
         */
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(
                        ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "인증이 필요하거나 유효하지 않은 토큰입니다.")
                )
        );
    }
}
