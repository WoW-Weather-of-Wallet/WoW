package com.wow.domain.user.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 10, message = "이름은 10자 이하여야 합니다.")
    /*
     * 수정 이유:
     * - 프로필 수정은 부분 업데이트라 null은 허용해야 하지만, "" 또는 공백-only 이름은 저장되면 안 됩니다.
     * - @Pattern은 null을 허용하므로 선택 수정 API 성격을 유지하면서 공백 이름만 차단할 수 있습니다.
     *
     * 수정 전 코드:
     * - @Size(max = 10, ...)
     * - private String name;
     */
    @Pattern(regexp = "^(?!\\s*$).+", message = "이름은 공백만 입력할 수 없습니다.")
    private String name;

    @Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
    private String gender;

    @Past(message = "생년월일은 오늘 이전 날짜여야 합니다.")
    private LocalDate birthDate;

}
