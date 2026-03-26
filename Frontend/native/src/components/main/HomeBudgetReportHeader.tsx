import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeBudgetReportHeaderProps {
  monthLabel: string;
  userName?: string | null;
}

export default function HomeBudgetReportHeader({
  monthLabel,
  userName,
}: HomeBudgetReportHeaderProps) {
  const rowStyle = {
    gap: wp(12),
    marginBottom: hp(18),
  } as const;

  const eyebrowStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  } as const;

  const titleStyle = {
    fontSize: fp(27),
    lineHeight: fp(35),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  const titleHighlightStyle = {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  } as const;

  const badgeStyle = {
    gap: wp(4),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.aiBadgeBackground,
    paddingHorizontal: wp(10),
    paddingVertical: hp(7),
  } as const;

  const badgeTextStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  } as const;

  return (
    <View className="flex-row items-center justify-between" style={rowStyle}>
      <View className="flex-1 items-start">
        <Text style={eyebrowStyle}>{monthLabel}</Text>
        <Text style={titleStyle}>
          {userName ? (
            <>
              <Text style={titleHighlightStyle}>{userName}</Text>
              님의 예산 현황
            </>
          ) : (
            '이번 달 예산 리포트'
          )}
        </Text>
      </View>

      <View className="flex-row items-center self-start" style={badgeStyle}>
        <Ionicons name="sparkles-outline" size={wp(14)} color={COLORS.primary} />
        <Text style={badgeTextStyle}>AI</Text>
      </View>
    </View>
  );
}
