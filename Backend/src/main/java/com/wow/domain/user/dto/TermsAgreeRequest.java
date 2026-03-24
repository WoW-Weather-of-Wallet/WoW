package com.wow.domain.user.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Getter
public class TermsAgreeRequest {

    @Valid
    @NotEmpty(message = "agreements must not be empty.")
    private List<TermAgreementItemRequest> agreements;
}
