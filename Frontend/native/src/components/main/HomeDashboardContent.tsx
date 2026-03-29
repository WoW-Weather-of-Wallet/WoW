import React from 'react';
import { View } from 'react-native';

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
  sectionGap?: number;
}

export default function HomeDashboardContent({
  weatherCard,
  spendingTypeCard,
  budgetReportCard,
  onPressSpendingType,
  onPressBudgetReport,
  layoutMode = 'regular',
  sectionGap = hp(18),
}: HomeDashboardContentProps) {
  const isCompact = layoutMode === 'compact';
  const isTall = layoutMode === 'tall';
  const cardHeights = isCompact
    ? { weather: hp(168), spending: hp(140), budget: hp(278) }
    : { weather: hp(184), spending: hp(154), budget: hp(304) };

  const spacerStyle = isTall
    ? { minHeight: sectionGap, flexGrow: 1 }
    : { height: sectionGap };

  return (
    <View style={{ flex: 1 }}>
      <HomeTodayWeatherCard
        weatherName={weatherCard.weatherName}
        description={weatherCard.weatherDescription}
        iconCode={weatherCard.weatherIconCode}
        isLoading={weatherCard.isWeatherLoading}
        style={{ minHeight: cardHeights.weather }}
      />
      <View style={spacerStyle} />
      <HomeSpendingTypeCard
        onPress={onPressSpendingType}
        title={spendingTypeCard.spendingTypeTitle}
        description={spendingTypeCard.spendingTypeDescription}
        iconName={spendingTypeCard.spendingTypeIconName}
        style={{ minHeight: cardHeights.spending }}
      />
      <View style={spacerStyle} />
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
    </View>
  );
}
