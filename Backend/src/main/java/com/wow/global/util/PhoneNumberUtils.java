package com.wow.global.util;

public class PhoneNumberUtils {

    private PhoneNumberUtils() {}

    public static String normalize(String phoneNumber) {
        /*
         * 수정 이유:
         * - 호출부 대부분은 DTO 검증 뒤에 오지만, 유틸 자체는 null 입력에도 안전한 편이 좋습니다.
         * - 예기치 않은 null 입력이 들어와도 NPE 대신 빈 문자열로 처리해 후속 검증 로직이 자연스럽게 동작하도록 변경했습니다.
         *
         * 수정 전 코드:
         * - return phoneNumber.replaceAll("[^0-9]", "");
         */
        if (phoneNumber == null) {
            return "";
        }

        return phoneNumber.replaceAll("[^0-9]", "");
    }

}
