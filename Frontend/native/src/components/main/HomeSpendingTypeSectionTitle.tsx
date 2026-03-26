import React from 'react';
import { Text } from 'react-native';

import { COLORS, FONTS, fp, hp } from '../../constants/theme';

type HomeSpendingTypeSectionTitleProps = {
  title: string;
};

export default function HomeSpendingTypeSectionTitle({
  title,
}: HomeSpendingTypeSectionTitleProps) {
  const titleStyle = {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(14),
  } as const;

  return <Text style={titleStyle}>{title}</Text>;
}
