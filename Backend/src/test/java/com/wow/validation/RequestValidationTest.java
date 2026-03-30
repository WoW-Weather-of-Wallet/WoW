package com.wow.validation;

import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.FindPwRequest;
import com.wow.domain.auth.dto.SmsSendRequest;
import com.wow.domain.auth.dto.SmsVerifyRequest;
import com.wow.domain.auth.dto.TokenRefreshRequest;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.auth.dto.ssafy.SsafyCheckRequest;
import com.wow.domain.user.dto.UpdatePhoneRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class RequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void tearDownValidator() {
        validatorFactory.close();
    }

    @Test
    void userCreateRequestRejectsNullUserId() {
        UserCreateRequest request = new UserCreateRequest();
        ReflectionTestUtils.setField(request, "pw", "Password123!");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);

        Set<ConstraintViolation<UserCreateRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("userId");
    }

    @Test
    void userCreateRequestRejectsEmailStyleUserId() {
        UserCreateRequest request = new UserCreateRequest();
        ReflectionTestUtils.setField(request, "userId", "test@example.com");
        ReflectionTestUtils.setField(request, "pw", "Password123!");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "termsAgreed", true);

        Set<ConstraintViolation<UserCreateRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("userId");
    }

    @Test
    void tokenRefreshRequestRejectsBlankRefreshToken() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        ReflectionTestUtils.setField(request, "refreshToken", "   ");

        Set<ConstraintViolation<TokenRefreshRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("refreshToken");
    }

    @Test
    void updateProfileRequestRejectsBlankOnlyName() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "name", "   ");

        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("name");
    }

    @Test
    void updateProfileRequestAllowsNullNameForPartialUpdate() {
        UpdateProfileRequest request = new UpdateProfileRequest();

        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .doesNotContain("name");
    }

    @Test
    void findIdRequestRejectsNullGender() {
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");

        Set<ConstraintViolation<FindIdRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("gender");
    }

    @Test
    void findIdRequestRejectsInvalidGender() {
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");
        ReflectionTestUtils.setField(request, "gender", "X");

        Set<ConstraintViolation<FindIdRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("gender");
    }

    @Test
    void findPasswordRequestRejectsNullGender() {
        FindPwRequest request = new FindPwRequest();
        ReflectionTestUtils.setField(request, "userId", "wowuser");
        ReflectionTestUtils.setField(request, "name", "tester");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");
        ReflectionTestUtils.setField(request, "newPw", "Valid1!A");

        Set<ConstraintViolation<FindPwRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("gender");
    }

    @Test
    void smsSendRequestRejectsInvalidPhoneNumberFormat() {
        SmsSendRequest request = new SmsSendRequest("invalid-phone");

        Set<ConstraintViolation<SmsSendRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("phoneNumber");
    }

    @Test
    void updatePhoneRequestRejectsInvalidPhoneNumberFormat() {
        UpdatePhoneRequest request = new UpdatePhoneRequest();
        ReflectionTestUtils.setField(request, "phoneNumber", "02-123-4567");

        Set<ConstraintViolation<UpdatePhoneRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("phoneNumber");
    }

    @Test
    void smsVerifyRequestRejectsNonSixDigitCode() {
        SmsVerifyRequest request = new SmsVerifyRequest("01012345678", "12AB");

        Set<ConstraintViolation<SmsVerifyRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("code");
    }

    @Test
    void ssafyCheckRequestRejectsInvalidPhoneNumberFormat() {
        SsafyCheckRequest request = new SsafyCheckRequest();
        ReflectionTestUtils.setField(request, "pendingToken", "pending-token");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "invalid-phone");

        Set<ConstraintViolation<SsafyCheckRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("phoneNumber");
    }

    @Test
    void ssafyCheckRequestRejectsBlankPendingToken() {
        SsafyCheckRequest request = new SsafyCheckRequest();
        ReflectionTestUtils.setField(request, "pendingToken", "   ");
        ReflectionTestUtils.setField(request, "gender", "M");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");

        Set<ConstraintViolation<SsafyCheckRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("pendingToken");
    }
}
