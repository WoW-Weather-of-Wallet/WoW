import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { monthlyComparisonLegend } from '../../constants/main/homeSheetData';
import LegendList from './LegendList';

interface HomeMonthlyReportSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function HomeMonthlyReportSheet({
  visible,
  onClose,
}: HomeMonthlyReportSheetProps) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="이번달 vs 지난달 비교"
      subtitle="카테고리별 지출 변화"
    >
      <View style={styles.compareRow}>
        <View style={styles.compareColumn}>
          <View style={styles.compareChipPrimary}>
            <Text style={styles.compareChipPrimaryText}>이번달 6월</Text>
          </View>
          <View style={styles.reportRing}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>64만원</Text>
              <Text style={styles.reportRingLabel}>총 지출</Text>
            </View>
          </View>
        </View>

        <View style={styles.compareColumn}>
          <View style={styles.compareChipMuted}>
            <Text style={styles.compareChipMutedText}>지난달 5월</Text>
          </View>
          <View style={[styles.reportRing, styles.reportRingMuted]}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>57만원</Text>
              <Text style={styles.reportRingLabel}>총 지출</Text>
            </View>
          </View>
        </View>
      </View>

      <LegendList items={monthlyComparisonLegend} variant="divider" />

      <View style={styles.insightCard}>
        <Ionicons name="bar-chart-outline" size={wp(22)} color={COLORS.primary} />
        <Text style={styles.insightText}>
          지난달보다 +70,000원 더 썼어요. 식비가 주요 원인이에요.
        </Text>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(12),
    marginBottom: hp(20),
  },
  compareColumn: { flex: 1, alignItems: 'center' },
  compareChipPrimary: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    marginBottom: hp(14),
  },
  compareChipPrimaryText: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  compareChipMuted: {
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F2F6',
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    marginBottom: hp(14),
  },
  compareChipMutedText: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  reportRing: {
    width: wp(140),
    height: wp(140),
    borderRadius: wp(70),
    borderWidth: wp(14),
    borderTopColor: '#E97975',
    borderRightColor: '#7D8DF1',
    borderBottomColor: '#F3B84D',
    borderLeftColor: '#86D5D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  reportRingMuted: {
    borderTopColor: '#F0A6A6',
    borderRightColor: '#A9B4F8',
    borderBottomColor: '#F5D5A1',
    borderLeftColor: '#B8E4E2',
  },
  reportRingCenter: {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(44),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  reportRingAmount: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  reportRingLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    backgroundColor: '#FFF5E8',
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginTop: hp(18),
  },
  insightText: {
    flex: 1,
    fontSize: fp(15),
    lineHeight: fp(22),
    fontFamily: FONTS.bold,
    color: '#A86A18',
  },
});
