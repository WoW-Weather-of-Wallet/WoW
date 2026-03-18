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
     *   이를 처리하지 않으면 전역 500으로 보여 사용자에게 서버 오류처럼 보일 수 있습니다.
     * - 인증 실패는 401로 응답하고, 프로젝트 전반과 동일하게 ErrorResponse 구조를 유지하는 편이
     *   프론트 처리와 테스트 작성 모두에 유리합니다.
     *
     * 수정 전 코드:
     * - AuthenticationException 전용 핸들러가 없었습니다.
     * - 혹은 Map 기반 응답처럼 예외 포맷이 흔들릴 수 있었습니다.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    /*
     * 수정 이유:
     * - DTO 검증 실패도 다른 예외와 같은 ErrorResponse 구조로 내려가야 응답 해석이 일관됩니다.
     * - 여러 필드 에러가 있어도 우선 첫 번째 메시지를 내려 현재 API 응답 스타일을 단순하게 유지합니다.
     *
     * 수정 전 코드:
     * - 검증 실패 메시지 구조가 다른 예외 응답과 달라질 여지가 있었습니다.
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
     * - unique 제약 위반은 서버 500보다 사용자 친화적인 중복 메시지로 내려주는 편이 낫습니다.
     * - phone_number, user_id, ssafy_oauth_id 같은 주요 컬럼은 메시지를 분리해 주어야
     *   사용자 안내와 운영 중 원인 파악이 쉬워집니다.
     *
     * 수정 전 코드:
     * - DataIntegrityViolationException이 일반 500 또는 뭉뚱그린 중복 메시지로 처리될 수 있었습니다.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        Throwable cause = e.getRootCause();
        if (cause instanceof SQLException sqlException && "23505".equals(sqlException.getSQLState())) {
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
     * - unique 제약 위반 메시지 분기가 handleDataIntegrityViolation 안에 직접 섞여 있으면
     *   조건이 늘어날수록 읽기 어려워집니다.
     * - 제약조건명과 사용자 메시지 매핑을 한 곳에 모아두면 이후 컬럼이 추가돼도 수정 지점이 명확합니다.
     *
     * 수정 전 코드:
     * - handleDataIntegrityViolation 내부에서 phone_number, user_id, ssafy_oauth_id를 직접 분기했습니다.
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
