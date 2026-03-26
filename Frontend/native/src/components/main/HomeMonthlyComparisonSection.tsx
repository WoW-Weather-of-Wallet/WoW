import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import type { LegendListItem } from '../../constants/main/types';
import LegendList from './LegendList';
import { styles } from './HomeMonthlyReportSheet.styles';

interface HomeMonthlyComparisonSectionProps {
  currentMonthLabel?: string;
  currentTotalAmount?: number | null;
  lastMonthLabel?: string;
  lastTotalAmount?: number | null;
  amountLabel: string;
  comparisonLegend: LegendListItem[];
  emptyLegendLabel: string;
}

export default function HomeMonthlyComparisonSection({
  currentMonthLabel,
  currentTotalAmount,
  lastMonthLabel,
  lastTotalAmount,
  amountLabel,
  comparisonLegend,
  emptyLegendLabel,
}: HomeMonthlyComparisonSectionProps) {
  return (
    <>
      <View style={styles.compareRow}>
        <View style={styles.compareColumn}>
          <View style={styles.compareChipPrimary}>
            <Text style={styles.compareChipPrimaryText}>{currentMonthLabel || '-'}</Text>
          </View>
          <View style={styles.reportRing}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>
                {currentTotalAmount == null ? '-' : `${currentTotalAmount.toLocaleString()}원`}
              </Text>
              <Text style={styles.reportRingLabel}>{amountLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.compareColumn}>
          <View style={styles.compareChipMuted}>
            <Text style={styles.compareChipMutedText}>{lastMonthLabel || '-'}</Text>
          </View>
          <View style={[styles.reportRing, styles.reportRingMuted]}>
            <View style={styles.reportRingCenter}>
              <Text style={styles.reportRingAmount}>
                {lastTotalAmount == null ? '-' : `${lastTotalAmount.toLocaleString()}원`}
              </Text>
              <Text style={styles.reportRingLabel}>{amountLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <LegendList
        items={
          comparisonLegend.length > 0
            ? comparisonLegend
            : [{ id: 'empty', label: emptyLegendLabel, value: '-', color: COLORS.textTertiary }]
        }
        variant="divider"
      />
    </>
  );
}
