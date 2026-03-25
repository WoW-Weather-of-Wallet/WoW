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
  const usageRate = Math.max(0, Math.min(budgetUsageRate ?? 0, 100));
  const hasBudgetData = [remainingBudget, budgetUsageRate, spentAmount, totalBudget].some(
    (value) => value != null,
  );
  const trimmedUserName = userName?.trim();
  const helperMessage = hasBudgetData
    ? `이번 달 소비 ${spentAmount == null ? '-' : `${spentAmount.toLocaleString()}원`} / 총 예산 ${
        totalBudget == null ? '-' : `${totalBudget.toLocaleString()}원`
      }`
    : '지출 데이터가 쌓이면 이번 달 예산 흐름을 정확하게 안내해드릴게요.';
  const forecastMessage =
    forecastText?.trim() ||
    (hasBudgetData
      ? '월말 예측 문구를 곧 보여드릴게요.'
      : '월간 리포트를 열어 소비 패턴과 절약 팁을 먼저 확인해보세요.');
  const remainingValue =
    remainingBudget == null ? '준비 중' : `${remainingBudget.toLocaleString()}원`;
  const usageLabel = budgetUsageRate == null ? '예산 분석 대기' : `${budgetUsageRate}% 사용`;

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
