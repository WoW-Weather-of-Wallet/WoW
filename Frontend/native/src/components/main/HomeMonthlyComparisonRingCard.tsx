import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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

  const chipStyle = {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    marginBottom: hp(14),
    backgroundColor: isPrimary ? COLORS.primarySoft : COLORS.mutedBackground,
  } as const;

  const chipTextStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: isPrimary ? COLORS.primary : COLORS.textSecondary,
  } as const;

  const ringStyle = {
    width: wp(140),
    height: wp(140),
    borderRadius: wp(70),
    borderWidth: wp(14),
    borderTopColor: isPrimary ? COLORS.chartRed : COLORS.chartRedMuted,
    borderRightColor: isPrimary ? COLORS.chartBlue : COLORS.chartBlueMuted,
    borderBottomColor: isPrimary ? COLORS.chartYellow : COLORS.chartYellowMuted,
    borderLeftColor: isPrimary ? COLORS.chartGreen : COLORS.chartGreenMuted,
    backgroundColor: COLORS.white,
  } as const;

  const ringCenterStyle = {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(44),
    backgroundColor: COLORS.background,
  } as const;

  const amountStyle = {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  } as const;

  const labelStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <View className="flex-1 items-center">
      <View style={chipStyle}>
        <Text style={chipTextStyle}>{monthLabel || '-'}</Text>
      </View>
      <View className="items-center justify-center" style={ringStyle}>
        <View className="items-center justify-center" style={ringCenterStyle}>
          <Text style={amountStyle}>
            {totalAmount == null ? '-' : `${totalAmount.toLocaleString()}원`}
          </Text>
          <Text style={labelStyle}>{amountLabel}</Text>
        </View>
      </View>
    </View>
  );
}
