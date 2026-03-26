import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { ReasonHighlightCardProps } from './types';

const TONE_BACKGROUNDS = {
  red: COLORS.reasonRedBackground,
  purple: COLORS.reasonPurpleBackground,
  green: COLORS.reasonGreenBackground,
} as const;

export default function ReasonHighlightCard({
  title,
  description,
  tone,
}: ReasonHighlightCardProps) {
  const cardStyle = {
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(12),
    backgroundColor: TONE_BACKGROUNDS[tone],
  } as const;

  const titleStyle = {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  } as const;

  const descriptionStyle = {
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={descriptionStyle}>{description}</Text>
    </View>
  );
}
