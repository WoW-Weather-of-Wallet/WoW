package com.wow.global;

import com.wow.global.common.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAuthenticationExceptionReturnsUnauthorized() {
        ResponseEntity<ErrorResponse> response =
                handler.handleAuthenticationException(new BadCredentialsException("bad credentials"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsPhoneNumberMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on phone_number", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 사용 중인 전화번호입니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsSsafyMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on ssafy_oauth_id", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 가입된 SSAFY 계정입니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsGenericDuplicateMessageWhenConstraintUnknown() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on another_column", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 사용 중인 값입니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsInternalServerErrorWhenSqlStateIsNotUniqueViolation() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("other", new SQLException("other failure", "99999"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 오류가 발생했습니다."));
    }
}
