package com.wow.domain.AI.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class AiAnalysisResponse {

    private Cluster cluster;
    private List<Category> categories;
    private List<Overspending> overspending;
    private Summary summary;
    private List<Tip> tips;
    private Goal goal;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Cluster {
        private Integer id;
        private String name;
        private String description;
        private String icon;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Category {
        private String name;
        private Long amount;
        @JsonProperty("my_ratio")
        private Double myRatio;
        @JsonProperty("base_ratio")
        private Double baseRatio;
        private Double diff;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Overspending {
        private String name;
        @JsonProperty("my_ratio")
        private Double myRatio;
        @JsonProperty("base_ratio")
        private Double baseRatio;
        @JsonProperty("savable_amount")
        private Long savableAmount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Summary {
        @JsonProperty("total_savable")
        private Long totalSavable;
        @JsonProperty("expected_spending")
        private Long expectedSpending;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Tip {
        private Integer order;
        private String keyword;
        private String title;
        private String description;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Goal {
        @JsonProperty("savable_amount")
        private Long savableAmount;
        @JsonProperty("expected_spending")
        private Long expectedSpending;
        @JsonProperty("action_tip")
        private String actionTip;
    }
}
