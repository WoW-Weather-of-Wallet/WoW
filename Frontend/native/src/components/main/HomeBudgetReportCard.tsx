import React from 'react';
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, hp, wp } from '../../constants/theme';
import { useHomeBudgetReportSummary } from '../../hooks/useHomeBudgetReportSummary';
import HomeBudgetReportHeader from './HomeBudgetReportHeader';
import HomeBudgetReportStatus from './HomeBudgetReportStatus';
import HomeBudgetReportTexts from './HomeBudgetReportTexts';

interface HomeBudgetReportCardProps {
  monthLabel: string;
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function HomeBudgetReportCard({
  monthLabel,
  userName,
  remainingBudget,
  budgetUsageRate,
  spentAmount,
  totalBudget,
  forecastText,
  onPress,
  style,
}: HomeBudgetReportCardProps) {
  const {
    usageRate,
    hasBudgetData,
    trimmedUserName,
    helperMessage,
    forecastMessage,
    remainingValue,
    usageLabel,
  } = useHomeBudgetReportSummary({
    userName,
    remainingBudget,
    budgetUsageRate,
    spentAmount,
    totalBudget,
    forecastText,
  });

  const cardStyle = {
    borderRadius: RADIUS.xxl,
    paddingHorizontal: wp(22),
    paddingVertical: hp(22),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  } as const;

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={onPress}
      className="overflow-hidden"
      style={style}
    >
      <View
        style={{
          ...cardStyle,
          backgroundColor: COLORS.background,
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <HomeBudgetReportHeader monthLabel={monthLabel} userName={trimmedUserName} />
        <HomeBudgetReportStatus
          hasBudgetData={hasBudgetData}
          remainingValue={remainingValue}
          usageLabel={usageLabel}
          usageRate={usageRate}
        />
        <HomeBudgetReportTexts
          helperMessage={helperMessage}
          forecastMessage={forecastMessage}
        />
      </View>
    </TouchableOpacity>
  );
}
