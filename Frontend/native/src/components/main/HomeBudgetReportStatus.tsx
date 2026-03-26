import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './HomeBudgetReportCard.styles';

interface HomeBudgetReportStatusProps {
  hasBudgetData: boolean;
  remainingValue: string;
  usageLabel: string;
  usageRate: number;
}

export default function HomeBudgetReportStatus({
  hasBudgetData,
  remainingValue,
  usageLabel,
  usageRate,
}: HomeBudgetReportStatusProps) {
  return (
    <>
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
        <View style={[styles.progressFill, { width: `${usageRate}%` }]} />
      </View>
    </>
  );
}
