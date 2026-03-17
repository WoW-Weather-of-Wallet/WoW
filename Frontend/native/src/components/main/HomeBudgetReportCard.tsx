import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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
      <LinearGradient colors={['#FAFBFF', '#EEF1FF']} style={styles.heroCard}>
        <View style={[styles.rowBetween, styles.heroTop]}>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>{monthLabel} 소비 리포트</Text>
            <Text style={styles.heroTitle}>
              {userName}님{'\n'}이번 달 예산 흐름을 한눈에 확인해보세요
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

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  flex1: { flex: 1 },
  heroCard: {
    borderRadius: RADIUS.xxl,
    padding: wp(22),
    borderWidth: 1,
    borderColor: '#E7EAFA',
  },
  heroTop: { alignItems: 'flex-start', marginBottom: hp(18) },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  heroTitle: {
    fontSize: fp(27),
    lineHeight: fp(35),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    alignSelf: 'flex-start',
    backgroundColor: '#EFEEFF',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(7),
  },
  aiBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  amountLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  amountValue: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  usageChip: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  },
  usageChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  progressTrack: {
    width: '100%',
    height: hp(10),
    borderRadius: RADIUS.full,
    backgroundColor: '#DDE2FF',
    overflow: 'hidden',
    marginVertical: hp(14),
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  helperText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  forecastText: {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: hp(8),
  },
});
