package com.wow.domain.spendinganalysis.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class SpendingMonthlyCompareResponse {

    private MonthData currentMonth;
    private MonthData lastMonth;

    public static SpendingMonthlyCompareResponse of(
            MonthData currentMonth,
            MonthData lastMonth
    ) {
        return new SpendingMonthlyCompareResponse(currentMonth, lastMonth);
    }

    public static SpendingMonthlyCompareResponse empty(MonthData currentMonth, MonthData lastMonth) {
        return new SpendingMonthlyCompareResponse(currentMonth, lastMonth);
    }

    @Getter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class MonthData {
        private int year;
        private int month;
        private int totalAmount;
        private List<CategoryData> categories;

        public static MonthData of(
                int year,
                int month,
                int totalAmount,
                List<CategoryData> categories
        ) {
            return new MonthData(year, month, totalAmount, categories);
        }

        public static MonthData empty(int year, int month) {
            return new MonthData(year, month, 0, List.of());
        }
    }

    @Getter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    public static class CategoryData {
        private Integer categoryId;
        private String categoryName;
        private String icon;
        private Integer percentage;

        @JsonInclude(JsonInclude.Include.NON_NULL)
        private Trend trend;

        public static CategoryData current(
                Integer categoryId,
                String categoryName,
                String icon,
                Integer percentage,
                Trend trend
        ) {
            return new CategoryData(categoryId, categoryName, icon, percentage, trend);
        }

        public static CategoryData previous(
                Integer categoryId,
                String categoryName,
                String icon,
                Integer percentage
        ) {
            return new CategoryData(categoryId, categoryName, icon, percentage, null);
        }
    }

    public enum Trend {
        UP,
        DOWN,
        SAME
    }
}
