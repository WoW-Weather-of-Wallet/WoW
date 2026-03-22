import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeBudgetReportCard.styles';

interface HomeBudgetReportCardProps {
  monthLabel: string;
  userName: string;
  remainingBudget: number;
  budgetUsageRate: number;
  spentAmount: number;
  totalBudget: number;
  forecastText: string;
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
  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPress}>
      <LinearGradient 
        colors={[COLORS.budgetGradientStart, COLORS.budgetGradientEnd]} 
        style={styles.heroCard}
      >
        <View style={[styles.rowBetween, styles.heroTop]}>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>{monthLabel} 소비 리포트</Text>
            <Text style={styles.heroTitle}>
              <Text style={styles.heroTitleHighlight}>{userName}</Text>님{'\n'}이번 달 예산 흐름을 한눈에 확인해보세요
            </Text>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons
              name="sparkles-outline"
              size={wp(14)}
              color={COLORS.primary}
            />
            <Text style={styles.aiBadgeText}>AI 분석</Text>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.amountLabel}>남은 예산</Text>
            <Text style={styles.amountValue}>
              {remainingBudget.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.usageChip}>
            <Text style={styles.usageChipText}>{budgetUsageRate}% 사용</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${budgetUsageRate}%` }]}
          />
        </View>

        <Text style={styles.helperText}>
          현재 지출 {spentAmount.toLocaleString()}원 / 총 예산{' '}
          {totalBudget.toLocaleString()}원
        </Text>
        <Text style={styles.forecastText}>{forecastText}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

