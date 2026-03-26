import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import SheetInfoButton from './SheetInfoButton';
import type { SheetIconHeaderProps } from './types';

export default function SheetIconHeader({
  iconName,
  eyebrow,
  title,
  onPressInfo,
}: SheetIconHeaderProps) {
  const containerStyle = {
    gap: wp(14),
  } as const;

  const iconWrapStyle = {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(18),
    backgroundColor: COLORS.sheetIconBackground,
  } as const;

  const eyebrowRowStyle = {
    gap: wp(4),
    paddingTop: hp(4),
  } as const;

  const eyebrowStyle = {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(2),
  } as const;

  const titleStyle = {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  return (
    <View className="flex-row items-center" style={containerStyle}>
      <View className="items-center justify-center" style={iconWrapStyle}>
        <Ionicons name={iconName} size={wp(26)} color={COLORS.primary} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center" style={eyebrowRowStyle}>
          <Text style={eyebrowStyle}>{eyebrow}</Text>
          {onPressInfo && <SheetInfoButton onPress={onPressInfo} size={wp(16)} />}
        </View>
        <Text style={titleStyle}>{title}</Text>
      </View>
    </View>
  );
}
