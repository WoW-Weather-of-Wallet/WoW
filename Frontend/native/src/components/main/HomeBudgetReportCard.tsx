import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
import { useHomeBudgetReportSummary } from '../../hooks/useHomeBudgetReportSummary';
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
        <View style={[styles.rowBetween, styles.heroTop]}>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>{monthLabel}</Text>
            <Text style={styles.heroTitle}>
              {trimmedUserName ? (
                <>
                  <Text style={styles.heroTitleHighlight}>{trimmedUserName}</Text>님의 예산 현황
                </>
              ) : (
                '이번 달 예산 리포트'
              )}
            </Text>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons
              name="sparkles-outline"
              size={wp(14)}
              color={COLORS.primary}
            />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.amountLabel}>{hasBudgetData ? '남은 예산' : '리포트 준비 중'}</Text>
            <Text style={styles.amountValue}>{remainingValue}</Text>
          </View>
          <View style={styles.usageChip}>
            <Text style={styles.usageChipText}>{usageLabel}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${usageRate}%` }]}
          />
        </View>

        <Text style={styles.helperText}>{helperMessage}</Text>
        <Text style={styles.forecastText}>{forecastMessage}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
