import React from 'react';
import HomeBudgetReportCard from './HomeBudgetReportCard';
import HomeScheduleSection from './HomeScheduleSection';
import HomeSpendingTypeCard from './HomeSpendingTypeCard';
import HomeTodayWeatherCard from './HomeTodayWeatherCard';

interface HomeDashboardContentProps {
  weatherName?: string | null;
  weatherDescription?: string | null;
  weatherIconCode?: string | null;
  isWeatherLoading: boolean;
  spendingTypeTitle?: string | null;
  spendingTypeDescription?: string | null;
  spendingTypeIconName?: React.ComponentProps<typeof HomeSpendingTypeCard>['iconName'];
  monthLabel: string;
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
  onPressSpendingType: () => void;
  onPressBudgetReport: () => void;
}

export default function HomeDashboardContent({
  weatherName,
  weatherDescription,
  weatherIconCode,
  isWeatherLoading,
  spendingTypeTitle,
  spendingTypeDescription,
  spendingTypeIconName,
  monthLabel,
  userName,
  remainingBudget,
  budgetUsageRate,
  spentAmount,
  totalBudget,
  forecastText,
  onPressSpendingType,
  onPressBudgetReport,
}: HomeDashboardContentProps) {
  return (
    <>
      <HomeTodayWeatherCard
        weatherName={weatherName}
        description={weatherDescription}
        iconCode={weatherIconCode}
        isLoading={isWeatherLoading}
      />
      <HomeSpendingTypeCard
        onPress={onPressSpendingType}
        title={spendingTypeTitle}
        description={spendingTypeDescription}
        iconName={spendingTypeIconName}
      />
      <HomeBudgetReportCard
        monthLabel={monthLabel}
        userName={userName}
        remainingBudget={remainingBudget}
        budgetUsageRate={budgetUsageRate}
        spentAmount={spentAmount}
        totalBudget={totalBudget}
        forecastText={forecastText}
        onPress={onPressBudgetReport}
      />
      <HomeScheduleSection items={[]} />
    </>
  );
}
