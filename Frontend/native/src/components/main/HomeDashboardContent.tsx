import React from 'react';

import HomeBudgetReportCard from './HomeBudgetReportCard';
import HomeScheduleSection from './HomeScheduleSection';
import HomeSpendingTypeCard from './HomeSpendingTypeCard';
import HomeTodayWeatherCard from './HomeTodayWeatherCard';

export interface HomeDashboardWeatherCardData {
  weatherName?: string | null;
  weatherDescription?: string | null;
  weatherIconCode?: string | null;
  isWeatherLoading: boolean;
}

export interface HomeDashboardSpendingTypeCardData {
  spendingTypeTitle?: string | null;
  spendingTypeDescription?: string | null;
  spendingTypeIconName?: React.ComponentProps<typeof HomeSpendingTypeCard>['iconName'];
}

export interface HomeDashboardBudgetReportCardData {
  monthLabel: string;
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
}

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
