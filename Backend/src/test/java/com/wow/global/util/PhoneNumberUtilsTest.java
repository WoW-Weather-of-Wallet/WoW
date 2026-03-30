package com.wow.global.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PhoneNumberUtilsTest {

    @Test
    void normalizeReturnsEmptyStringWhenPhoneNumberIsNull() {
        /*
         * 회귀 방지 목적:
         * - null 입력 시 NPE가 아니라 빈 문자열을 반환하도록 한 방어 로직이 유지되는지 확인합니다.
         */
        assertThat(PhoneNumberUtils.normalize(null)).isEmpty();
    }

    @Test
    void normalizeRemovesNonDigitCharacters() {
        /*
         * 회귀 방지 목적:
         * - 기존 정규화 동작도 그대로 유지되는지 함께 확인합니다.
         */
        assertThat(PhoneNumberUtils.normalize("010-1234-5678")).isEqualTo("01012345678");
    }
}
