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
  const containerStyle = {
    gap: hp(10),
    marginBottom: hp(14),
  } as const;

  const rowStyle = {
    gap: wp(12),
  } as const;

  const amountLabelStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(4),
  } as const;

  const amountValueStyle = {
    fontSize: fp(32),
    lineHeight: fp(38),
    fontFamily: FONTS.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
  } as const;

  const usageChipStyle = {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(11),
    paddingVertical: hp(7),
  } as const;

  const usageChipTextStyle = {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  } as const;

  const progressTrackStyle = {
    height: hp(8),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.progressTrackBackground,
  } as const;

  return (
    <View style={containerStyle}>
      <View className="flex-row items-end justify-between" style={rowStyle}>
        <View className="flex-1 pr-3">
          <Text style={amountLabelStyle}>
            {hasBudgetData ? '남은 예산' : '예산을 먼저 등록해 주세요'}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={amountValueStyle}>
            {remainingValue}
          </Text>
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
    </View>
  );
}
