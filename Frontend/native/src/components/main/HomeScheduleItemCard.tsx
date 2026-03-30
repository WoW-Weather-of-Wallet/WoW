import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { HomeScheduleItem } from '../../mock/dashboard';

interface HomeScheduleItemCardProps {
  item: HomeScheduleItem;
}

export default function HomeScheduleItemCard({ item }: HomeScheduleItemCardProps) {
  const isPaid = item.status === 'paid';

  const rowStyle = {
    gap: wp(12),
    paddingVertical: hp(4),
  } as const;

  const titleStyle = {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  } as const;

  const subtitleStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  const rightStyle = {
    gap: hp(6),
  } as const;

  const amountStyle = {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  const chipStyle = {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    backgroundColor: isPaid ? COLORS.statusDoneBackground : COLORS.statusWarningBackground,
  } as const;

  const chipTextStyle = {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: isPaid ? COLORS.statusDoneText : COLORS.statusWarningText,
  } as const;

  return (
    <View className="flex-row items-center" style={rowStyle}>
      <View className="flex-1">
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={subtitleStyle}>{item.dueLabel}</Text>
      </View>

      <View className="items-end" style={rightStyle}>
        <Text style={amountStyle}>{item.amount}</Text>
        <View style={chipStyle}>
          <Text style={chipTextStyle}>{isPaid ? '완료' : '예정'}</Text>
        </View>
      </View>
    </View>
  );
}
