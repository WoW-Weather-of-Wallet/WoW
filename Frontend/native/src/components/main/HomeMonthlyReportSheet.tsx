import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, wp } from '../../constants/theme';
import { monthlyComparisonLegend } from '../../constants/main/homeSheetData';
import LegendList from './LegendList';
import { styles } from './HomeMonthlyReportSheet.styles';

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
          지난달보다 +70,000원 더 썼어요. 외식과 커피/음료 지출이 주요 원인이에요.
        </Text>
      </View>
    </BottomSheetModal>
  );
}
