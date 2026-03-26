import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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
  const rowStyle = { gap: wp(12) } as const;

  const amountLabelStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  } as const;

  const amountValueStyle = {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  const usageChipStyle = {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  } as const;

  const usageChipTextStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  } as const;

  const progressTrackStyle = {
    height: hp(10),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.progressTrackBackground,
    marginVertical: hp(14),
  } as const;

  return (
    <>
      <View className="flex-row items-center justify-between" style={rowStyle}>
        <View>
          <Text style={amountLabelStyle}>
            {hasBudgetData ? '남은 예산' : '리포트 준비 중'}
          </Text>
          <Text style={amountValueStyle}>{remainingValue}</Text>
        </View>

        <View style={usageChipStyle}>
          <Text style={usageChipTextStyle}>{usageLabel}</Text>
        </View>
      </View>

      <View className="w-full overflow-hidden" style={progressTrackStyle}>
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${usageRate}%` }}
        />
      </View>
    </>
  );
}
