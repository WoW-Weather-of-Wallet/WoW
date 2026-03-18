package com.wow.domain.user.dto;

import com.wow.global.constant.ValidationPatterns;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 10, message = "이름은 10자 이하만 가능합니다.")
    /*
     * 수정 이유:
     * - 부분 수정 요청은 null을 허용해야 하지만, "" 또는 공백-only 이름은 막아야 합니다.
     * - @Pattern은 null을 통과시키므로 선택 수정 API에 맞으면서도 공백 이름 저장을 차단합니다.
     *
     * 수정 전 코드:
     * - @Size(max = 10, ...)
     * - private String name;
     */
    @Pattern(regexp = "^(?!\\s*$).+", message = "이름은 공백만 입력할 수 없습니다.")
    private String name;

    @Pattern(regexp = ValidationPatterns.GENDER, message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @Past(message = "생년월일은 과거 날짜만 가능합니다.")
    private LocalDate birthDate;
}
