import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

type SpendingStyleGuideHeaderProps = {
  title: string;
  subtitle: ReactNode;
  onClose: () => void;
};

export default function SpendingStyleGuideHeader({
  title,
  subtitle,
  onClose,
}: SpendingStyleGuideHeaderProps) {
  const headerStyle = {
    paddingTop: hp(24),
    paddingHorizontal: wp(24),
    marginBottom: hp(16),
  } as const;

  const titleRowStyle = {
    marginBottom: hp(8),
  } as const;

  const titleStyle = {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(8),
  } as const;

  const subtitleStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(18),
  } as const;

  const closeButtonStyle = {
    marginRight: wp(-4),
  } as const;

  return (
    <View style={headerStyle}>
      <View className="flex-row items-center justify-between" style={titleRowStyle}>
        <Text style={titleStyle}>{title}</Text>
        <TouchableOpacity
          activeOpacity={0.86}
          className="p-1"
          style={closeButtonStyle}
          onPress={onClose}
        >
          <Ionicons name="close" size={wp(22)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <Text style={subtitleStyle}>{subtitle}</Text>
    </View>
  );
}
