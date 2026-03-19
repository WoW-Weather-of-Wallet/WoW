package com.wow.domain.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wow.domain.auth.dto.FindIdResponse;
import com.wow.domain.auth.dto.TokenRefreshResponse;
import com.wow.domain.auth.dto.UserCreateResponse;
import com.wow.domain.auth.service.AuthService;
import com.wow.domain.auth.service.SmsService;
import com.wow.global.GlobalExceptionHandler;
import com.wow.global.exception.BadRequestException;
import com.wow.global.exception.InvalidTokenException;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class AuthControllerMockMvcTest {

    private static final String AUTH_BASE_URL = "/api/v1/auth";
    private static final String DEFAULT_PHONE_NUMBER = "010-1234-5678";
    private static final String DEFAULT_BIRTH_DATE = "1999-01-01";

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
        performPost("/signup", signupRequest(Map.of("userId", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void signupReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        when(authService.signup(any())).thenReturn(
                new UserCreateResponse(
                        "wowuser", "tester", "M", "01012345678", LocalDate.of(1999, 1, 1), true
                )
        );

        performPost("/signup", signupRequest(Map.of()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value("wowuser"))
                .andExpect(jsonPath("$.name").value("tester"));
    }

    @Test
    void checkUserIdReturnsBadRequestErrorResponseWhenServiceRejectsInvalidFormat() throws Exception {
        when(authService.checkUserId("INVALID-ID"))
                .thenThrow(new BadRequestException("invalid userId"));

        mockMvc.perform(get(AUTH_BASE_URL + "/check-user-id")
                        .param("userId", "INVALID-ID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").value("invalid userId"));
    }

    @Test
    void refreshReturnsUnauthorizedErrorResponseWhenServiceRejectsToken() throws Exception {
        when(authService.refresh("invalid-refresh-token"))
                .thenThrow(new InvalidTokenException("invalid refresh token"));

        performPost("/refresh", Map.of("refreshToken", "invalid-refresh-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.UNAUTHORIZED.value()))
                .andExpect(jsonPath("$.errorMessage").value("invalid refresh token"));
    }

    @Test
    void refreshReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        when(authService.refresh("refresh-token"))
                .thenReturn(new TokenRefreshResponse(
                        "new-access-token", 1800L, "new-refresh-token", 1209600L
                ));

        performPost("/refresh", Map.of("refreshToken", "refresh-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("new-refresh-token"));
    }

    @Test
    void refreshReturnsBadRequestErrorResponseWhenRefreshTokenIsBlank() throws Exception {
        performPost("/refresh", Map.of("refreshToken", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void sendSmsReturnsBadRequestErrorResponseWhenPhoneNumberValidationFails() throws Exception {
        performPost("/sms/send", Map.of("phoneNumber", "01012"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void sendSmsReturnsOkWhenRequestIsValid() throws Exception {
        performPost("/sms/send", Map.of("phoneNumber", DEFAULT_PHONE_NUMBER))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(smsService).sendCode(DEFAULT_PHONE_NUMBER);
    }

    @Test
    void verifySmsReturnsBadRequestErrorResponseWhenCodeValidationFails() throws Exception {
        performPost("/sms/verify", smsVerifyRequest(Map.of("code", "12345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void verifySmsReturnsOkWhenRequestIsValid() throws Exception {
        performPost("/sms/verify", smsVerifyRequest(Map.of()))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(smsService).verifyCode(DEFAULT_PHONE_NUMBER, "123456");
    }

    @Test
    void findIdReturnsBadRequestErrorResponseWhenValidationFails() throws Exception {
        performPost("/find/id", findIdRequest(Map.of("name", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void findIdReturnsSuccessResponseWhenRequestIsValid() throws Exception {
        when(authService.findId(any())).thenReturn(new FindIdResponse("wowuser"));

        performPost("/find/id", findIdRequest(Map.of()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("wowuser"));
    }

    @Test
    void findPasswordReturnsBadRequestErrorResponseWhenValidationFails() throws Exception {
        performPost("/find/password", findPasswordRequest(Map.of("name", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").isNotEmpty());
    }

    @Test
    void findPasswordReturnsNoContentWhenRequestIsValid() throws Exception {
        performPost("/find/password", findPasswordRequest(Map.of()))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(authService).findPassword(any());
    }

    @Test
    void signupReturnsBadRequestErrorResponseWhenJsonIsMalformed() throws Exception {
        mockMvc.perform(post(AUTH_BASE_URL + "/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":\"wowuser\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.BAD_REQUEST.value()))
                .andExpect(jsonPath("$.errorMessage").value("요청 본문 형식이 올바르지 않습니다."));
    }

    @Test
    void returnsNotFoundErrorResponseWhenEndpointDoesNotExist() throws Exception {
        mockMvc.perform(post(AUTH_BASE_URL + "/missing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.NOT_FOUND.value()))
                .andExpect(jsonPath("$.errorMessage").value("요청한 리소스를 찾을 수 없습니다."));
    }

    @Test
    void returnsMethodNotAllowedErrorResponseWhenHttpMethodIsInvalid() throws Exception {
        mockMvc.perform(get(AUTH_BASE_URL + "/signup"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.httpStatusCode").value(HttpStatus.METHOD_NOT_ALLOWED.value()))
                .andExpect(jsonPath("$.errorMessage").value("허용되지 않은 HTTP 메서드입니다."));
    }

    private ResultActions performPost(String path, Map<String, Object> requestBody) throws Exception {
        return mockMvc.perform(post(AUTH_BASE_URL + path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)));
    }

    private Map<String, Object> signupRequest(Map<String, Object> overrides) {
        return merge(Map.of(
                "userId", "wowuser",
                "pw", "Valid1!A",
                "name", "tester",
                "gender", "M",
                "phoneNumber", DEFAULT_PHONE_NUMBER,
                "birthDate", DEFAULT_BIRTH_DATE,
                "termsAgreed", true,
                "alarmEnabled", true
        ), overrides);
    }

    private Map<String, Object> smsVerifyRequest(Map<String, Object> overrides) {
        return merge(Map.of(
                "phoneNumber", DEFAULT_PHONE_NUMBER,
                "code", "123456"
        ), overrides);
    }

    private Map<String, Object> findIdRequest(Map<String, Object> overrides) {
        return merge(Map.of(
                "name", "tester",
                "birthDate", DEFAULT_BIRTH_DATE,
                "gender", "M",
                "phoneNumber", DEFAULT_PHONE_NUMBER
        ), overrides);
    }

    private Map<String, Object> findPasswordRequest(Map<String, Object> overrides) {
        return merge(Map.of(
                "userId", "wowuser",
                "name", "tester",
                "gender", "M",
                "birthDate", DEFAULT_BIRTH_DATE,
                "phoneNumber", DEFAULT_PHONE_NUMBER,
                "newPw", "Valid1!A"
        ), overrides);
    }

    private Map<String, Object> merge(Map<String, Object> defaults, Map<String, Object> overrides) {
        java.util.LinkedHashMap<String, Object> merged = new java.util.LinkedHashMap<>(defaults);
        merged.putAll(overrides);
        return merged;
    }
}
