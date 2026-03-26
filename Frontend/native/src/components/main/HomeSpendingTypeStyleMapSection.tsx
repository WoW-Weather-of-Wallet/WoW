import React from 'react';
import { Text, View } from 'react-native';

import type { SpendingStyleMetric } from '../../constants/main/types';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import HomeSpendingTypeSectionTitle from './HomeSpendingTypeSectionTitle';
import HomeSpendingTypeStyleMapContent from './HomeSpendingTypeStyleMapContent';

interface HomeSpendingTypeStyleMapSectionProps {
  title: string;
  hasMetrics: boolean;
  metrics: SpendingStyleMetric[];
  emptyMessage: string;
}

export default function HomeSpendingTypeStyleMapSection({
  title,
  hasMetrics,
  metrics,
  emptyMessage,
}: HomeSpendingTypeStyleMapSectionProps) {
  const emptyCardStyle = {
    gap: wp(18),
    marginBottom: hp(20),
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.spendingTypeIntro,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
  } as const;

  const emptyTextStyle = {
    fontSize: fp(15),
    lineHeight: fp(24),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <>
      <HomeSpendingTypeSectionTitle title={title} />
      {hasMetrics ? (
        <HomeSpendingTypeStyleMapContent metrics={metrics} />
      ) : (
        <View style={emptyCardStyle}>
          <Text style={emptyTextStyle}>{emptyMessage}</Text>
        </View>
      )}
    </>
  );
}
