import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarDayDetail } from '../../mock/calendar';

interface CalendarDayDetailSheetProps {
  detail: CalendarDayDetail | null;
  visible: boolean;
  memoValue: string;
  onChangeMemo: (value: string) => void;
  onClose: () => void;
}

function getWeatherIconName(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return 'moon-outline' as const;
  }

  return detail.weatherLabel === '맑음' ? 'sunny-outline' : 'partly-sunny-outline';
}

/**
 * 날짜별 상세 시트는 미래 날짜와 실제 소비가 있는 날짜를 같은 구조 안에서 보여줍니다.
 */
export default function CalendarDayDetailSheet({
  detail,
  visible,
  memoValue,
  onChangeMemo,
  onClose,
}: CalendarDayDetailSheetProps) {
  if (!detail) {
    return null;
  }

  return (
    <BottomSheetModal visible={visible} onClose={onClose} showHandle={false}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{detail.title}</Text>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <Ionicons name={getWeatherIconName(detail)} size={wp(28)} color={COLORS.primary} />
          <View>
            <Text style={styles.weatherLabel}>{detail.weatherLabel}</Text>
            <Text style={styles.weatherHint}>{detail.weatherHint}</Text>
          </View>
        </View>
        <Text style={styles.temperature}>{detail.weatherTemperature}</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>지출</Text>
          <Text style={[styles.metricValue, styles.metricSpent]}>
            {detail.spentAmount === null ? '-' : `-₩${detail.spentAmount.toLocaleString()}`}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>건수</Text>
          <Text style={[styles.metricValue, styles.metricCount]}>
            {detail.transactionCount === null ? '-' : `${detail.transactionCount}건`}
          </Text>
        </View>
      </View>

      {detail.items.length > 0 ? (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>내역</Text>
          {detail.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={wp(18)}
                    color={COLORS.textPrimary}
                  />
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.itemAmount}>-₩{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.memoSection}>
        <Text style={styles.memoTitle}>오늘의 메모</Text>
        <TextInput
          value={memoValue}
          onChangeText={onChangeMemo}
          placeholder="이 날의 소비 기록이나 느낌을 남겨보세요..."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.memoInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>메모 저장</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    marginBottom: hp(16),
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: '#F1F0FF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(14),
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  weatherLabel: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: hp(4),
  },
  weatherHint: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  temperature: {
    fontSize: fp(26),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  metricRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginBottom: hp(18),
  },
  metricCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    padding: wp(16),
  },
  metricTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
    marginBottom: hp(6),
  },
  metricValue: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
  },
  metricSpent: {
    color: '#D87272',
  },
  metricCount: {
    color: COLORS.primary,
  },
  listSection: {
    marginBottom: hp(18),
  },
  listTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(10),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(10),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  iconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  itemSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  itemAmount: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: '#D87272',
  },
  memoSection: {
    marginBottom: hp(18),
  },
  memoTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(10),
  },
  memoInput: {
    minHeight: hp(108),
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  saveButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(16),
  },
  saveButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
