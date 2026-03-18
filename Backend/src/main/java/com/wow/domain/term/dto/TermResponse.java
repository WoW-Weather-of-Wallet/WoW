package com.wow.domain.term.dto;

import com.wow.domain.term.entity.Term;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class TermResponse {

    private Long termId;
    private String title;
    private String version;
    private boolean required;
    private String fileUrl;

    public static TermResponse from(Term term, String fileUrl) {
        return new TermResponse(
                term.getId(),
                term.getTitle(),
                term.getVersion(),
                term.isRequired(),
                fileUrl
        );
    }
}
