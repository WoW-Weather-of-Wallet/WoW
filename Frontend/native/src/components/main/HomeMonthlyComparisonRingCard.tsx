import React from 'react';
import { Text, View } from 'react-native';

import { styles } from './HomeMonthlyReportSheet.styles';

type HomeMonthlyComparisonRingCardProps = {
  monthLabel?: string;
  totalAmount?: number | null;
  amountLabel: string;
  tone?: 'primary' | 'muted';
};

export default function HomeMonthlyComparisonRingCard({
  monthLabel,
  totalAmount,
  amountLabel,
  tone = 'primary',
}: HomeMonthlyComparisonRingCardProps) {
  const isPrimary = tone === 'primary';

  return (
    <View style={styles.compareColumn}>
      <View style={isPrimary ? styles.compareChipPrimary : styles.compareChipMuted}>
        <Text style={isPrimary ? styles.compareChipPrimaryText : styles.compareChipMutedText}>
          {monthLabel || '-'}
        </Text>
      </View>
      <View style={[styles.reportRing, tone === 'muted' && styles.reportRingMuted]}>
        <View style={styles.reportRingCenter}>
          <Text style={styles.reportRingAmount}>
            {totalAmount == null ? '-' : `${totalAmount.toLocaleString()}??`}
          </Text>
          <Text style={styles.reportRingLabel}>{amountLabel}</Text>
        </View>
      </View>
    </View>
  );
}
