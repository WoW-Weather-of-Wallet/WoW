package com.wow.domain.AI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class AiAnalysisResponse {

    private Cluster cluster;
    private List<Category> categories;
    private List<Overspending> overspending;
    private Summary summary;
    private List<Tip> tips;
    private Goal goal;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Cluster {
        private Integer id;
        private String name;
        private String description;
        private String icon;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Category {
        private String name;
        private Long amount;
        private Double myRatio;
        private Double baseRatio;
        private Double diff;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Overspending {
        private String name;
        private Double myRatio;
        private Double baseRatio;
        private Long savableAmount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Summary {
        private Long totalSavable;
        private Long expectedSpending;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Tip {
        private Integer order;
        private String keyword;
        private String title;
        private String description;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Goal {
        private Long savableAmount;
        private Long expectedSpending;
        private String actionTip;
    }
}