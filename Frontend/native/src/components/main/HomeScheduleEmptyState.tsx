import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface HomeScheduleEmptyStateProps {
  title: string;
  description: string;
}

export default function HomeScheduleEmptyState({
  title,
  description,
}: HomeScheduleEmptyStateProps) {
  const emptyStateStyle = {
    gap: wp(14),
    paddingVertical: hp(8),
  } as const;

  const iconWrapStyle = {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: COLORS.primary50,
  } as const;

  const textWrapStyle = {
    gap: hp(4),
  } as const;

  const titleStyle = {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  } as const;

  const descriptionStyle = {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <View className="flex-row items-center" style={emptyStateStyle}>
      <View className="items-center justify-center" style={iconWrapStyle}>
        <Ionicons name="calendar-clear-outline" size={wp(22)} color={COLORS.primary} />
      </View>

      <View className="flex-1" style={textWrapStyle}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={descriptionStyle}>{description}</Text>
      </View>
    </View>
  );
}
