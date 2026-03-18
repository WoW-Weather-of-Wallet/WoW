package com.wow.domain.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import com.wow.global.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerMockMvcTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private LocalValidatorFactoryBean validator;

    @Mock
    private AuthService authService;

    @Mock
    private SmsService smsService;

    @BeforeEach
    void setUp() {
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService, smsService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void signupReturnsBadRequestErrorResponseWhenValidationFails() throws Exception {
        Map<String, Object> request = Map.of(
                "userId", "",
                "pw", "Valid1!A",
                "name", "tester",
                "gender", "M",
                "phoneNumber", "010-1234-5678",
                "birthDate", "1999-01-01",
                "termsAgreed", true,
                "alarmEnabled", true
        );

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void refreshReturnsBadRequestErrorResponseWhenServiceRejectsToken() throws Exception {
        when(authService.refresh("invalid-refresh-token"))
                .thenThrow(new IllegalArgumentException("invalid refresh token"));

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("refreshToken", "invalid-refresh-token")
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").value("invalid refresh token"));
    }

    @Test
    void refreshReturnsBadRequestErrorResponseWhenRefreshTokenIsBlank() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("refreshToken", "")
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }
}
