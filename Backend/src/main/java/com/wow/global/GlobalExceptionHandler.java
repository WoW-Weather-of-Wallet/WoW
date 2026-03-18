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

    private static final String UNIQUE_VIOLATION_SQL_STATE = "23505";

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
    }

    /*
     * 수정 이유:
     * - 로그인 실패 시 AuthenticationManager가 AuthenticationException 계열을 던질 수 있는데,
     *   이를 잡지 않으면 전역 500으로 보여 사용자에게 서버 오류처럼 보일 수 있습니다.
     * - 인증 실패는 401 응답과 ErrorResponse 구조로 통일해 프론트가 일관되게 처리할 수 있게 합니다.
     *
     * 수정 전 코드:
     * - AuthenticationException 전용 핸들러가 없었고,
     *   일부 흐름은 Map 기반 JSON 응답을 직접 만들고 있었습니다.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    /*
     * 수정 이유:
     * - DTO 검증 실패도 다른 예외와 동일한 ErrorResponse 구조로 내려가야
     *   클라이언트가 하나의 형식으로 처리할 수 있습니다.
     * - 여러 필드 오류가 동시에 있어도 가장 먼저 발생한 메시지를 내려
     *   사용자에게 명확한 피드백을 제공합니다.
     *
     * 수정 전 코드:
     * - 검증 실패 응답 형식이 다른 예외 응답과 섞여 있었습니다.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST.value(), message));
    }

    /*
     * 수정 이유:
     * - unique 제약조건 위반은 서버 오류가 아니라 사용자 입력 충돌에 가깝기 때문에
     *   컬럼별로 읽을 수 있는 메시지를 내려주는 편이 좋습니다.
     * - phone_number, user_id, ssafy_oauth_id 중복을 구분해주면
     *   프론트와 운영 로그 모두 원인 파악이 쉬워집니다.
     *
     * 수정 전 코드:
     * - DataIntegrityViolationException이 일반 500 또는 모호한 중복 메시지로 처리될 수 있었습니다.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        Throwable cause = e.getRootCause();
        if (cause instanceof SQLException sqlException
                && UNIQUE_VIOLATION_SQL_STATE.equals(sqlException.getSQLState())) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of(
                            HttpStatus.BAD_REQUEST.value(),
                            resolveDuplicateMessage(sqlException.getMessage())
                    ));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버 오류가 발생했습니다."));
    }

    /*
     * 수정 이유:
     * - unique 제약조건별 사용자 메시지 매핑을 한 곳에 모아두면
     *   핸들러 본문이 단순해지고, 새 제약조건이 생겨도 여기만 수정하면 됩니다.
     *
     * 수정 전 코드:
     * - handleDataIntegrityViolation 내부에서 컬럼 분기를 직접 처리했습니다.
     */
    private String resolveDuplicateMessage(String message) {
        if (message == null) {
            return "이미 사용 중인 값입니다.";
        }
        if (message.contains("phone_number")) {
            return "이미 사용 중인 전화번호입니다.";
        }
        if (message.contains("user_id")) {
            return "이미 사용 중인 아이디입니다.";
        }
        if (message.contains("ssafy_oauth_id")) {
            return "이미 가입된 SSAFY 계정입니다.";
        }
        return "이미 사용 중인 값입니다.";
    }
}
