package com.wow.validation;

import com.wow.domain.auth.dto.TokenRefreshRequest;
import com.wow.domain.auth.dto.UserCreateRequest;
import com.wow.domain.auth.dto.FindIdRequest;
import com.wow.domain.auth.dto.SmsSendRequest;
import com.wow.domain.user.dto.UpdateProfileRequest;
import com.wow.domain.user.dto.UpdatePhoneRequest;
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
        /*
         * 회귀 방지 목적:
         * - userId에 @Pattern만 있을 때 null이 통과하던 문제를 다시 열지 않도록 검증합니다.
         */
        UserCreateRequest request = new UserCreateRequest();
        ReflectionTestUtils.setField(request, "pw", "Password123!");
        ReflectionTestUtils.setField(request, "name", "홍길동");
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
        /*
         * 회귀 방지 목적:
         * - /refresh 입력 검증이 빠져 빈 refresh token이 서비스까지 전달되지 않도록 확인합니다.
         */
        TokenRefreshRequest request = new TokenRefreshRequest();
        ReflectionTestUtils.setField(request, "refreshToken", "   ");

        Set<ConstraintViolation<TokenRefreshRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("refreshToken");
    }

    @Test
    void updateProfileRequestRejectsBlankOnlyName() {
        /*
         * 회귀 방지 목적:
         * - 부분 수정 API에서는 null은 허용하되, 공백-only 이름은 막아야 합니다.
         */
        UpdateProfileRequest request = new UpdateProfileRequest();
        ReflectionTestUtils.setField(request, "name", "   ");

        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("name");
    }

    @Test
    void updateProfileRequestAllowsNullNameForPartialUpdate() {
        /*
         * 회귀 방지 목적:
         * - 프로필 수정은 부분 업데이트이므로 name이 null인 요청 자체는 유효해야 합니다.
         */
        UpdateProfileRequest request = new UpdateProfileRequest();

        Set<ConstraintViolation<UpdateProfileRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .doesNotContain("name");
    }

    @Test
    void findIdRequestRejectsNullGender() {
        /*
         * 회귀 방지 목적:
         * - 아이디 찾기 본인 확인 조건에 gender가 추가된 정책이 유지되는지 확인합니다.
         */
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "홍길동");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");

        Set<ConstraintViolation<FindIdRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("gender");
    }

    @Test
    void findIdRequestRejectsInvalidGender() {
        /*
         * 회귀 방지 목적:
         * - 아이디 찾기 gender 입력은 M/F만 허용하도록 유지되는지 확인합니다.
         */
        FindIdRequest request = new FindIdRequest();
        ReflectionTestUtils.setField(request, "name", "홍길동");
        ReflectionTestUtils.setField(request, "birthDate", LocalDate.of(1999, 1, 1));
        ReflectionTestUtils.setField(request, "phoneNumber", "01012345678");
        ReflectionTestUtils.setField(request, "gender", "X");

        Set<ConstraintViolation<FindIdRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("gender");
    }

    @Test
    void smsSendRequestRejectsInvalidPhoneNumberFormat() {
        /*
         * 회귀 방지 목적:
         * - SMS 발송 요청은 휴대폰 번호 형식이 맞지 않으면 DTO 단계에서 차단되어야 합니다.
         */
        SmsSendRequest request = new SmsSendRequest("invalid-phone");

        Set<ConstraintViolation<SmsSendRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("phoneNumber");
    }

    @Test
    void updatePhoneRequestRejectsInvalidPhoneNumberFormat() {
        /*
         * 회귀 방지 목적:
         * - 휴대폰 변경 요청도 동일한 번호 형식 규칙을 유지해야 합니다.
         */
        UpdatePhoneRequest request = new UpdatePhoneRequest();
        ReflectionTestUtils.setField(request, "phoneNumber", "02-123-4567");

        Set<ConstraintViolation<UpdatePhoneRequest>> violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("phoneNumber");
    }
}
