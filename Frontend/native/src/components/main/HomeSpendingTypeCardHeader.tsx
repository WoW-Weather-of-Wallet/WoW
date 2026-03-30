import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeSpendingTypeCardHeaderProps {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}

export default function HomeSpendingTypeCardHeader({
  title,
  iconName,
}: HomeSpendingTypeCardHeaderProps) {
  const rowStyle = {
    gap: wp(12),
  } as const;

  const eyebrowStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  } as const;

  const titleRowStyle = {
    gap: wp(10),
  } as const;

  const iconBadgeStyle = {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: COLORS.aiBadgeBackground,
  } as const;

  const mainTitleStyle = {
    fontSize: fp(24),
    lineHeight: fp(31),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  const aiBadgeStyle = {
    gap: wp(4),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.aiBadgeBackground,
    paddingHorizontal: wp(10),
    paddingVertical: hp(7),
  } as const;

  const aiBadgeTextStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  } as const;

  return (
    <View className="flex-row items-center justify-between" style={rowStyle}>
      <View className="flex-1">
        <Text style={eyebrowStyle}>AI 소비 유형 분석</Text>

        <View className="flex-row items-center" style={titleRowStyle}>
          <View className="items-center justify-center" style={iconBadgeStyle}>
            <Ionicons name={iconName} size={wp(18)} color={COLORS.primary} />
          </View>
          <Text style={mainTitleStyle}>{title}</Text>
        </View>
      </View>

      <View className="flex-row items-center self-start" style={aiBadgeStyle}>
        <Ionicons name="sparkles-outline" size={wp(14)} color={COLORS.primary} />
        <Text style={aiBadgeTextStyle}>AI 리포트</Text>
      </View>
    </View>
  );
}
