package com.wow.global;

import static org.assertj.core.api.Assertions.assertThat;

import com.wow.global.common.ErrorResponse;
import com.wow.global.exception.BusinessException;
import com.wow.global.exception.InternalServerException;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleIllegalArgumentReturnsBadRequest() {
        ResponseEntity<ErrorResponse> response =
                handler.handleIllegalArgument(new IllegalArgumentException("bad request"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "bad request"));
    }

    @Test
    void handleBusinessExceptionReturnsMatchingStatusAndMessage() {
        BusinessException exception = new BusinessException(HttpStatus.CONFLICT, "이미 사용 중인 값이 존재합니다.") {};

        ResponseEntity<ErrorResponse> response = handler.handleBusinessException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.CONFLICT.value(), "이미 사용 중인 값이 존재합니다."));
    }

    @Test
    void handleInternalServerBusinessExceptionReturnsGeneric500Message() {
        ResponseEntity<ErrorResponse> response =
                handler.handleBusinessException(new InternalServerException("서버 내부 처리 중 오류가 발생했습니다."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 내부 처리 중 오류가 발생했습니다."));
    }

    @Test
    void handleAuthenticationExceptionReturnsUnauthorized() {
        ResponseEntity<ErrorResponse> response =
                handler.handleAuthenticationException(new BadCredentialsException("bad credentials"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "인증 정보가 올바르지 않습니다."));
    }

    @Test
    void handleHttpMessageNotReadableReturnsBadRequest() {
        ResponseEntity<ErrorResponse> response =
                handler.handleHttpMessageNotReadable(
                        new HttpMessageNotReadableException("invalid body", org.mockito.Mockito.mock(HttpInputMessage.class))
                );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "요청 본문 형식이 올바르지 않습니다."));
    }

    @Test
    void handleMethodNotSupportedReturnsMethodNotAllowed() {
        ResponseEntity<ErrorResponse> response =
                handler.handleMethodNotSupported(new HttpRequestMethodNotSupportedException("PATCH"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.METHOD_NOT_ALLOWED.value(), "허용되지 않은 HTTP 메서드입니다."));
    }

    @Test
    void handleNoResourceFoundReturnsNotFound() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNoResourceFound(new NoResourceFoundException(HttpMethod.GET, "/missing"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.NOT_FOUND.value(), "요청한 리소스를 찾을 수 없습니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsPhoneNumberMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on phone_number", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.CONFLICT.value(), "이미 사용 중인 전화번호입니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsSsafyMessage() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on ssafy_oauth_id", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.CONFLICT.value(), "이미 등록된 SSAFY 계정입니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsGenericDuplicateMessageWhenConstraintUnknown() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("duplicate", new SQLException("duplicate key on another_column", "23505"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.CONFLICT.value(), "이미 사용 중인 값이 존재합니다."));
    }

    @Test
    void handleDataIntegrityViolationReturnsInternalServerErrorWhenSqlStateIsNotUniqueViolation() {
        ResponseEntity<ErrorResponse> response = handler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("other", new SQLException("other failure", "99999"))
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 내부 처리 중 오류가 발생했습니다."));
    }

    @Test
    void handleUnexpectedReturnsInternalServerError() {
        ResponseEntity<ErrorResponse> response = handler.handleUnexpected(new RuntimeException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody())
                .usingRecursiveComparison()
                .isEqualTo(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 내부 처리 중 오류가 발생했습니다."));
    }
}
