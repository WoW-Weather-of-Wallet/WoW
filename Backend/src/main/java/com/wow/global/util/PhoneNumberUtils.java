package com.wow.global.util;

public class PhoneNumberUtils {

    private PhoneNumberUtils() {}

    public static String normalize(String phoneNumber) {
        return phoneNumber.replaceAll("[^0-9]", "");
    }

}
