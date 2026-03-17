package com.wow.global;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity.badRequest()
                .body(Map.of("message", message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        Throwable cause = e.getRootCause();
        if (cause instanceof SQLException sqlException && "23505".equals(sqlException.getSQLState())) {
            String message = sqlException.getMessage();
            if (message != null && message.contains("phone_number")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "이미 사용 중인 전화번호입니다."));
            } else if (message != null && message.contains("user_id")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "이미 사용 중인 아이디입니다."));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "이미 사용 중인 값입니다."));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "서버 오류가 발생했습니다."));
    }

}
