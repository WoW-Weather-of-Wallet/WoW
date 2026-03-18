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

export default function CalendarHeroCard({
  overview,
  monthLabel,
  onPressPrevMonth,
  onPressNextMonth,
  onPressAdd,
}: CalendarHeroCardProps) {
  return (
    <LinearGradient
      colors={['#6E60D7', '#8D73F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>{overview.title}</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.addButton} onPress={onPressAdd}>
          <Text style={styles.addButtonText}>+ 내역 추가</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthRow}>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressPrevMonth}>
          <Ionicons name="chevron-back" size={wp(18)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.monthArrow} onPress={onPressNextMonth}>
          <Ionicons name="chevron-forward" size={wp(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherIconWrap}>
          <Ionicons name="partly-sunny" size={wp(25)} color="#FFC94D" />
        </View>
        <View style={styles.weatherTextBlock}>
          <Text style={styles.weatherTitle}>{overview.weatherTitle}</Text>
          <Text style={styles.weatherHint}>{overview.weatherHint}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>이번 달 절약 금액</Text>
          <Text style={styles.summaryAmount}>₩{overview.savingsAmount.toLocaleString()}원</Text>
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
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
    paddingBottom: hp(18),
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  screenTitle: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF3A',
    backgroundColor: '#FFFFFF14',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
  },
  addButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    marginBottom: hp(16),
  },
  monthArrow: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: '#FFFFFF22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF14',
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    marginBottom: hp(16),
  },
  weatherIconWrap: {
    width: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(10),
  },
  weatherTextBlock: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
    marginBottom: hp(4),
  },
  weatherHint: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#ECE7FF',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#E7E1FF',
    marginBottom: hp(6),
  },
  summaryAmount: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: '#FFFFFF1E',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(14),
    paddingVertical: hp(9),
  },
  goalBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
});
