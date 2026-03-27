package com.wow.domain.AI.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "AI report payload returned from the AI server and exposed by the backend.")
public class AiAnalysisResponse {

    @Schema(description = "Predicted spending cluster information.")
    private Cluster cluster;

    @Schema(description = "Category distribution for the rolling 3-month report window.")
    private List<Category> categories;

    @Schema(description = "Categories with the highest savings opportunity.")
    private List<Overspending> overspending;

    @Schema(description = "Overall savings summary.")
    private Summary summary;

    @Schema(description = "Actionable tips generated from the report.")
    private List<Tip> tips;

    @Schema(description = "Primary savings goal and action tip.")
    private Goal goal;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "Predicted spending cluster metadata.")
    public static class Cluster {
        @Schema(description = "Cluster identifier.", example = "1")
        private Integer id;

        @Schema(description = "Cluster display name.", example = "사무·서적형")
        private String name;

        @Schema(description = "Cluster explanation shown to the user.", example = "사무/교육용품과 서적/도서 비중이 높은 학습 집중형 유형입니다.")
        private String description;

        @Schema(description = "Cluster icon.", example = "📚")
        private String icon;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "A category result within the AI report.")
    public static class Category {
        @Schema(description = "Category name.", example = "커피/음료")
        private String name;

        @Schema(description = "Total spending amount for the category.", example = "233500")
        private Long amount;

        @JsonProperty("my_ratio")
        @Schema(description = "User spending ratio for the category.", example = "23.3")
        private Double myRatio;

        @JsonProperty("base_ratio")
        @Schema(description = "Cluster baseline ratio for the category.", example = "8.9")
        private Double baseRatio;

        @Schema(description = "Difference between user ratio and baseline ratio.", example = "14.4")
        private Double diff;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "A category that has a notable savings opportunity.")
    public static class Overspending {
        @Schema(description = "Category name.", example = "커피/음료")
        private String name;

        @JsonProperty("my_ratio")
        @Schema(description = "User spending ratio for the category.", example = "23.3")
        private Double myRatio;

        @JsonProperty("base_ratio")
        @Schema(description = "Cluster baseline ratio for the category.", example = "8.9")
        private Double baseRatio;

        @JsonProperty("savable_amount")
        @Schema(description = "Estimated savable amount for the category.", example = "16322")
        private Long savableAmount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "Report summary values.")
    public static class Summary {
        @JsonProperty("total_savable")
        @Schema(description = "Estimated total savable amount.", example = "29258")
        private Long totalSavable;

        @JsonProperty("expected_spending")
        @Schema(description = "Estimated expected spending after savings.", example = "970842")
        private Long expectedSpending;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "A single guidance tip in the AI report.")
    public static class Tip {
        @Schema(description = "Display order.", example = "1")
        private Integer order;

        @Schema(description = "Tip keyword.", example = "커피·간식")
        private String keyword;

        @Schema(description = "Tip title.", example = "커피·간식 빈도를 먼저 줄여보세요")
        private String title;

        @Schema(description = "Tip description shown to the user.", example = "하루 1회처럼 횟수 기준을 먼저 정해두면 지출을 안정적으로 줄일 수 있습니다.")
        private String description;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "Primary savings goal derived from the report.")
    public static class Goal {
        @JsonProperty("savable_amount")
        @Schema(description = "Estimated savable amount.", example = "29258")
        private Long savableAmount;

        @JsonProperty("expected_spending")
        @Schema(description = "Estimated expected spending after savings.", example = "970842")
        private Long expectedSpending;

        @JsonProperty("action_tip")
        @Schema(description = "Main action recommendation.", example = "커피/음료 구매 횟수를 주 3회 이내로 제한해보세요.")
        private String actionTip;
    }
}
