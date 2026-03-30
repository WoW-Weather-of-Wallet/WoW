import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, fp, wp } from '../../constants/theme';
import type { LegendListItem } from '../../constants/main/types';

type LegendListRowProps = {
  item: LegendListItem;
};

export default function LegendListRow({ item }: LegendListRowProps) {
  const leftStyle = {
    gap: wp(8),
  } as const;

  const dotStyle = {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: item.color,
  } as const;

  const labelStyle = {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  } as const;

  const valueStyle = {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: item.color,
  } as const;

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center" style={leftStyle}>
        <View style={dotStyle} />
        <Text style={labelStyle}>{item.label}</Text>
      </View>
      <Text style={valueStyle}>{item.value}</Text>
    </View>
  );
}
