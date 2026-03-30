import React from 'react';
import { Text } from 'react-native';

import { COLORS, FONTS, fp, hp } from '../../constants/theme';

interface HomeSpendingTypeCardDescriptionProps {
  description: string;
}

export default function HomeSpendingTypeCardDescription({
  description,
}: HomeSpendingTypeCardDescriptionProps) {
  const descriptionStyle = {
    marginTop: hp(14),
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return <Text style={descriptionStyle}>{description}</Text>;
}
