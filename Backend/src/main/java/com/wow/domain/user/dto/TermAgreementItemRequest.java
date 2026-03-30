package com.wow.domain.user.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class TermAgreementItemRequest {

    @NotNull(message = "termId is required.")
    @Positive(message = "termId must be greater than 0.")
    private Long termId;

    @NotNull(message = "agreed is required.")
    private Boolean agreed;
}
