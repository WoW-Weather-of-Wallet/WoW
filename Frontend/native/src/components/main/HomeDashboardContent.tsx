import React from 'react';

import type { ResponsiveLayoutMode } from '../../hooks/useResponsiveLayoutMode';
import { hp } from '../../constants/theme';
import type {
  HomeDashboardBudgetReportCardData,
  HomeDashboardSpendingTypeCardData,
  HomeDashboardWeatherCardData,
} from './types';
import HomeBudgetReportCard from './HomeBudgetReportCard';
import HomeSpendingTypeCard from './HomeSpendingTypeCard';
import HomeTodayWeatherCard from './HomeTodayWeatherCard';

interface HomeDashboardContentProps {
  weatherCard: HomeDashboardWeatherCardData;
  spendingTypeCard: HomeDashboardSpendingTypeCardData;
  budgetReportCard: HomeDashboardBudgetReportCardData;
  onPressSpendingType: () => void;
  onPressBudgetReport: () => void;
  layoutMode?: ResponsiveLayoutMode;
}

export default function HomeDashboardContent({
  weatherCard,
  spendingTypeCard,
  budgetReportCard,
  onPressSpendingType,
  onPressBudgetReport,
  layoutMode = 'regular',
}: HomeDashboardContentProps) {
  const cardHeights =
    layoutMode === 'compact'
      ? { weather: hp(196), spending: hp(170), budget: hp(278) }
      : layoutMode === 'tall'
        ? { weather: hp(246), spending: hp(208), budget: hp(332) }
        : { weather: hp(220), spending: hp(186), budget: hp(304) };

  return (
    <>
      <HomeTodayWeatherCard
        weatherName={weatherCard.weatherName}
        description={weatherCard.weatherDescription}
        iconCode={weatherCard.weatherIconCode}
        isLoading={weatherCard.isWeatherLoading}
        style={{ minHeight: cardHeights.weather }}
      />
      <HomeSpendingTypeCard
        onPress={onPressSpendingType}
        title={spendingTypeCard.spendingTypeTitle}
        description={spendingTypeCard.spendingTypeDescription}
        iconName={spendingTypeCard.spendingTypeIconName}
        style={{ minHeight: cardHeights.spending }}
      />
      <HomeBudgetReportCard
        monthLabel={budgetReportCard.monthLabel}
        userName={budgetReportCard.userName}
        remainingBudget={budgetReportCard.remainingBudget}
        budgetUsageRate={budgetReportCard.budgetUsageRate}
        spentAmount={budgetReportCard.spentAmount}
        totalBudget={budgetReportCard.totalBudget}
        forecastText={budgetReportCard.forecastText}
        onPress={onPressBudgetReport}
        style={{ minHeight: cardHeights.budget }}
      />
    </>
  );
}
