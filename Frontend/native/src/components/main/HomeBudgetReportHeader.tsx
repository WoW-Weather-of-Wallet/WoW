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
    marginBottom: hp(16),
  } as const;

  const eyebrowStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginBottom: hp(6),
  } as const;

  const titleStyle = {
    fontSize: fp(22),
    lineHeight: fp(30),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  } as const;

  const titleHighlightStyle = {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  } as const;

  const badgeStyle = {
    gap: wp(5),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.aiBadgeBackground,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  } as const;

  const badgeTextStyle = {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  } as const;

  return (
    <View className="flex-row items-start justify-between" style={rowStyle}>
      <View className="flex-1 pr-3">
        <Text style={eyebrowStyle}>{monthLabel} 예산 현황</Text>
        <Text style={titleStyle}>
          {userName ? (
            <>
              <Text style={titleHighlightStyle}>{userName}</Text>
              님의 이번 달 예산
            </>
          ) : (
            '이번 달 예산 현황'
          )}
        </Text>
      </View>

      <View className="flex-row items-center self-start" style={badgeStyle}>
        <Ionicons name="sparkles-outline" size={wp(13)} color={COLORS.primary} />
        <Text style={badgeTextStyle}>AI</Text>
      </View>
    </View>
  );
}
