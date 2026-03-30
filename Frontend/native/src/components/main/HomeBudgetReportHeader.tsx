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
  const topRowStyle = {
    marginBottom: hp(10),
  } as const;

  const eyebrowStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
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
    <View style={{ marginBottom: hp(16) }}>
      <View className="flex-row items-center justify-between" style={topRowStyle}>
        <Text style={eyebrowStyle} numberOfLines={1}>
          {monthLabel} 예산 현황
        </Text>

        <View className="flex-row items-center self-start" style={badgeStyle}>
          <Ionicons name="sparkles-outline" size={wp(13)} color={COLORS.primary} />
          <Text style={badgeTextStyle}>AI</Text>
        </View>
      </View>

      <Text style={titleStyle} numberOfLines={2}>
        {userName ? (
          <>
            <Text style={titleHighlightStyle}>{userName}</Text>
            님 이번 달 예산
          </>
        ) : (
          '이번 달 예산'
        )}
      </Text>
    </View>
  );
}
