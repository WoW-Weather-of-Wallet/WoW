import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeBudgetReportTextsProps {
  helperMessage: string;
  forecastMessage: string;
}

export default function HomeBudgetReportTexts({
  helperMessage,
  forecastMessage,
}: HomeBudgetReportTextsProps) {
  const helperTextStyle = {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  const forecastBoxStyle = {
    marginTop: hp(10),
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary50,
    paddingHorizontal: wp(12),
    paddingVertical: hp(11),
  } as const;

  const forecastTextStyle = {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  } as const;

  return (
    <View>
      <Text style={helperTextStyle}>{helperMessage}</Text>
      <View style={forecastBoxStyle}>
        <Text style={forecastTextStyle}>{forecastMessage}</Text>
      </View>
    </View>
  );
}
