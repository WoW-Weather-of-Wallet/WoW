import React from 'react';

import type {
  HomeDashboardBudgetReportCardData,
  HomeDashboardSpendingTypeCardData,
  HomeDashboardWeatherCardData,
} from './types';
import HomeBudgetReportCard from './HomeBudgetReportCard';
import HomeScheduleSection from './HomeScheduleSection';
import HomeSpendingTypeCard from './HomeSpendingTypeCard';
import HomeTodayWeatherCard from './HomeTodayWeatherCard';

interface HomeDashboardContentProps {
  weatherCard: HomeDashboardWeatherCardData;
  spendingTypeCard: HomeDashboardSpendingTypeCardData;
  budgetReportCard: HomeDashboardBudgetReportCardData;
  onPressSpendingType: () => void;
  onPressBudgetReport: () => void;
}

export default function HomeDashboardContent({
  weatherCard,
  spendingTypeCard,
  budgetReportCard,
  onPressSpendingType,
  onPressBudgetReport,
}: HomeDashboardContentProps) {
  return (
    <>
      <HomeTodayWeatherCard
        weatherName={weatherCard.weatherName}
        description={weatherCard.weatherDescription}
        iconCode={weatherCard.weatherIconCode}
        isLoading={weatherCard.isWeatherLoading}
      />
      <HomeSpendingTypeCard
        onPress={onPressSpendingType}
        title={spendingTypeCard.spendingTypeTitle}
        description={spendingTypeCard.spendingTypeDescription}
        iconName={spendingTypeCard.spendingTypeIconName}
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
      />
      <HomeScheduleSection items={[]} />
    </>
  );
}
