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
      title="이번 달 vs 지난달 비교"
      subtitle="-"
    >
      <View style={styles.compareRow}>
        <View style={styles.compareColumn}>
          <View style={styles.compareChipPrimary}>
            <Text style={styles.compareChipPrimaryText}>-</Text>
          </View>
          <View style={styles.reportRing}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>-</Text>
              <Text style={styles.reportRingLabel}>총 소비</Text>
            </View>
          </View>
        </View>

        <View style={styles.compareColumn}>
          <View style={styles.compareChipMuted}>
            <Text style={styles.compareChipMutedText}>-</Text>
          </View>
          <View style={[styles.reportRing, styles.reportRingMuted]}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>-</Text>
              <Text style={styles.reportRingLabel}>총 소비</Text>
            </View>
          </View>
        </View>
      </View>

      <LegendList items={monthlyComparisonLegend} variant="divider" />

      <View style={styles.insightCard}>
        <Ionicons name="bar-chart-outline" size={wp(22)} color={COLORS.primary} />
        <Text style={styles.insightText}>-</Text>
      </View>
    </BottomSheetModal>
  );
}
