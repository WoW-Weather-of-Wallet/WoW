import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarOverview } from '../../mock/calendar';

interface CalendarHeroCardProps {
  overview: CalendarOverview;
  monthLabel: string;
  onPressPrevMonth: () => void;
  onPressNextMonth: () => void;
  onPressAdd?: () => void;
}

/**
 * 상단 히어로 카드는 선택한 월 라벨과 그 달의 소비 안내 문구를 같이 보여줍니다.
 */
export default function CalendarHeroCard({
  overview,
  monthLabel,
  onPressPrevMonth,
  onPressNextMonth,
  onPressAdd,
}: CalendarHeroCardProps) {
  return (
    <LinearGradient
      colors={[COLORS.gradientStart, '#8B88F8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.heroTopRow}>
        <Text style={styles.heroTitle}>{overview.title}</Text>
        <TouchableOpacity activeOpacity={0.86} style={styles.heroActionButton} onPress={onPressAdd}>
          <Text style={styles.heroActionText}>+ 내역 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthSelectorRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.monthArrowButton}
          onPress={onPressPrevMonth}
        >
          <Ionicons name="chevron-back" size={wp(16)} color={COLORS.textInverse} />
        </TouchableOpacity>
        <Text style={styles.monthSelectorText}>{monthLabel}</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.monthArrowButton}
          onPress={onPressNextMonth}
        >
          <Ionicons name="chevron-forward" size={wp(16)} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherIconCard}>
          <Ionicons name="partly-sunny-outline" size={wp(26)} color={COLORS.primary} />
        </View>
        <View style={styles.weatherTextBlock}>
          <Text style={styles.weatherSubtitle}>{overview.weatherSubtitle}</Text>
          <Text style={styles.weatherTitle}>{overview.weatherTitle}</Text>
          <Text style={styles.weatherHint}>{overview.weatherHint}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>이번 달 절약 금액</Text>
          <Text style={styles.summaryAmount}>₩{overview.savingsAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.goalBadge}>
          <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
          <Text style={styles.goalBadgeText}>{overview.goalLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xxl,
    padding: wp(18),
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(16),
  },
  heroTitle: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  heroActionButton: {
    backgroundColor: '#FFFFFF26',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
  },
  heroActionText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(14),
    gap: wp(10),
  },
  monthArrowButton: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF26',
  },
  monthSelectorText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF1E',
    borderRadius: RADIUS.xl,
    padding: wp(14),
    marginBottom: hp(12),
  },
  weatherIconCard: {
    width: wp(54),
    height: wp(54),
    borderRadius: wp(18),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  weatherTextBlock: {
    flex: 1,
  },
  weatherSubtitle: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#DCD9FF',
    marginBottom: hp(2),
  },
  weatherTitle: {
    fontSize: fp(24),
    lineHeight: fp(29),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
    marginBottom: hp(4),
  },
  weatherHint: {
    fontSize: fp(13),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: '#E9E7FF',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF1A',
    borderRadius: RADIUS.xl,
    padding: wp(14),
  },
  summaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#DBD9FF',
    marginBottom: hp(6),
  },
  summaryAmount: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  },
  goalBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
