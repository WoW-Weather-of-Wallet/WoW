import React from 'react';
import { View } from 'react-native';

import { COLORS, hp, wp } from '../../constants/theme';
import type { LegendListItem } from '../../constants/main/types';
import LegendList from './LegendList';
import HomeMonthlyComparisonRingCard from './HomeMonthlyComparisonRingCard';

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
  const compareRowStyle = {
    gap: wp(12),
    marginBottom: hp(20),
  } as const;

  return (
    <>
      <View className="flex-row justify-between" style={compareRowStyle}>
        <HomeMonthlyComparisonRingCard
          monthLabel={currentMonthLabel}
          totalAmount={currentTotalAmount}
          amountLabel={amountLabel}
          tone="primary"
        />
        <HomeMonthlyComparisonRingCard
          monthLabel={lastMonthLabel}
          totalAmount={lastTotalAmount}
          amountLabel={amountLabel}
          tone="muted"
        />
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
