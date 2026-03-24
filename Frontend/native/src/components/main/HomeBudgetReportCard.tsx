import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
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
  const usageRate = budgetUsageRate ?? 0;

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
              <Text style={styles.heroTitleHighlight}>{userName || '-'}</Text>
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
            <Text style={styles.amountLabel}>남은 예산</Text>
            <Text style={styles.amountValue}>
              {remainingBudget == null ? '-' : `${remainingBudget.toLocaleString()}원`}
            </Text>
          </View>
          <View style={styles.usageChip}>
            <Text style={styles.usageChipText}>
              {budgetUsageRate == null ? '-' : `${budgetUsageRate}% 사용`}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${usageRate}%` }]}
          />
        </View>

        <Text style={styles.helperText}>
          이번 달 소비 {spentAmount == null ? '-' : `${spentAmount.toLocaleString()}원`} / 총 예산{' '}
          {totalBudget == null ? '-' : `${totalBudget.toLocaleString()}원`}
        </Text>
        <Text style={styles.forecastText}>{forecastText || '-'}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
