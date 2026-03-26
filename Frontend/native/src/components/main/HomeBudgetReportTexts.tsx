import React from 'react';
import { Text } from 'react-native';

import { COLORS, FONTS, fp, hp } from '../../constants/theme';

interface HomeBudgetReportTextsProps {
  helperMessage: string;
  forecastMessage: string;
}

export default function HomeBudgetReportTexts({
  helperMessage,
  forecastMessage,
}: HomeBudgetReportTextsProps) {
  const helperTextStyle = {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  const forecastTextStyle = {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: hp(8),
  } as const;

  return (
    <>
      <Text style={helperTextStyle}>{helperMessage}</Text>
      <Text style={forecastTextStyle}>{forecastMessage}</Text>
    </>
  );
}
