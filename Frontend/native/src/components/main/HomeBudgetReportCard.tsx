import React from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { useHomeBudgetReportSummary } from '../../hooks/useHomeBudgetReportSummary';
import HomeBudgetReportHeader from './HomeBudgetReportHeader';
import HomeBudgetReportStatus from './HomeBudgetReportStatus';
import HomeBudgetReportTexts from './HomeBudgetReportTexts';
import { styles } from './HomeBudgetReportCard.styles';

interface HomeBudgetReportCardProps {
  monthLabel: string;
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
  onPress: () => void;
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

  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPress}>
      <LinearGradient
        colors={[COLORS.budgetGradientStart, COLORS.budgetGradientEnd]}
        style={styles.heroCard}
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
      </LinearGradient>
    </TouchableOpacity>
  );
}
