package com.wow.global;

import com.wow.global.common.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
    }

    /*
     * 수정 이유:
     * - 로그인 실패 시 AuthenticationManager가 AuthenticationException 계열을 던질 수 있는데,
     *   이를 잡지 않으면 전역 500으로 보여 사용자에게 서버 오류처럼 보일 수 있습니다.
     * - 인증 실패는 401로 응답해 클라이언트가 정상적인 로그인 실패로 처리할 수 있게 합니다.
     *
     * 수정 전 코드:
     * - AuthenticationException 처리 핸들러가 없었습니다.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        Throwable cause = e.getRootCause();
        if (cause instanceof SQLException sqlException && "23505".equals(sqlException.getSQLState())) {
            String message = sqlException.getMessage();

            /*
             * 수정 이유:
             * - 기존에는 phone_number, user_id만 분기해서 SSAFY 계정 중복 같은 다른 unique 제약은 일반 메시지로 뭉개졌습니다.
             * - 자주 발생할 수 있는 ssafy_oauth_id도 함께 분기해 사용자 메시지와 로그 해석을 조금 더 명확히 합니다.
             *
             * 수정 전 코드:
             * - phone_number, user_id만 개별 분기
             */
            if (message != null && message.contains("phone_number")) {
                return ResponseEntity.badRequest()
                        .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 사용 중인 전화번호입니다."));
            }
            if (message != null && message.contains("user_id")) {
                return ResponseEntity.badRequest()
                        .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 사용 중인 아이디입니다."));
            }
            if (message != null && message.contains("ssafy_oauth_id")) {
                return ResponseEntity.badRequest()
                        .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 가입된 SSAFY 계정입니다."));
            }
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), "이미 사용 중인 값입니다."));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 오류가 발생했습니다."));
    }
}
