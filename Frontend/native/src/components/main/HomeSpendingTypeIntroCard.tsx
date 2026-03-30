import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeSpendingTypeIntroCardProps {
  description: string;
}

export default function HomeSpendingTypeIntroCard({
  description,
}: HomeSpendingTypeIntroCardProps) {
  const cardStyle = {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.spendingTypeIntro,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(18),
  } as const;

  const textStyle = {
    fontSize: fp(15),
    lineHeight: fp(24),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <View style={cardStyle}>
      <Text style={textStyle}>{description}</Text>
    </View>
  );
}
