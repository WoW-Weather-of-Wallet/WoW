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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
    void signupReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        Map<String, Object> request = Map.of(
                "userId", "wowuser",
                "pw", "Valid1!A",
                "name", "tester",
                "gender", "M",
                "phoneNumber", "010-1234-5678",
                "birthDate", "1999-01-01",
                "termsAgreed", true,
                "alarmEnabled", true
        );
        when(authService.signup(any())).thenReturn(
                new com.wow.domain.auth.dto.UserCreateResponse(
                        "wowuser", "tester", "M", "01012345678", java.time.LocalDate.of(1999, 1, 1), true
                )
        );

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("wowuser"))
                .andExpect(jsonPath("$.name").value("tester"));
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
    void refreshReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        when(authService.refresh("refresh-token"))
                .thenReturn(new com.wow.domain.auth.dto.TokenRefreshResponse(
                        "new-access-token", 1800L, "new-refresh-token", 1209600L
                ));

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("refreshToken", "refresh-token")
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
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

    @Test
    void sendSmsReturnsBadRequestErrorResponseWhenPhoneNumberValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sms/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("phoneNumber", "01012")
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void sendSmsReturnsOkWhenRequestIsValid() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sms/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("phoneNumber", "010-1234-5678")
                        )))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(smsService).sendCode("010-1234-5678");
    }

    @Test
    void verifySmsReturnsBadRequestErrorResponseWhenCodeValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sms/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "phoneNumber", "010-1234-5678",
                                        "code", "12345"
                                )
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void verifySmsReturnsOkWhenRequestIsValid() throws Exception {
        mockMvc.perform(post("/api/v1/auth/sms/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "phoneNumber", "010-1234-5678",
                                        "code", "123456"
                                )
                        )))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(smsService).verifyCode("010-1234-5678", "123456");
    }

    @Test
    void findIdReturnsBadRequestErrorResponseWhenValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/auth/find/id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "name", "",
                                        "birthDate", "1999-01-01",
                                        "gender", "M",
                                        "phoneNumber", "010-1234-5678"
                                )
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void findIdReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        when(authService.findId(any())).thenReturn(new com.wow.domain.auth.dto.FindIdResponse("wowuser"));

        mockMvc.perform(post("/api/v1/auth/find/id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "name", "tester",
                                        "birthDate", "1999-01-01",
                                        "gender", "M",
                                        "phoneNumber", "010-1234-5678"
                                )
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("wowuser"));
    }

    @Test
    void findPasswordReturnsBadRequestErrorResponseWhenValidationFails() throws Exception {
        mockMvc.perform(post("/api/v1/auth/find/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "userId", "wowuser",
                                        "name", "",
                                        "birthDate", "1999-01-01",
                                        "phoneNumber", "010-1234-5678",
                                        "newPw", "Valid1!A"
                                )
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void findPasswordReturnsNoContentWhenRequestIsValid() throws Exception {
        mockMvc.perform(post("/api/v1/auth/find/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of(
                                        "userId", "wowuser",
                                        "name", "tester",
                                        "birthDate", "1999-01-01",
                                        "phoneNumber", "010-1234-5678",
                                        "newPw", "Valid1!A"
                                )
                        )))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(authService).findPassword(any());
    }
}
