import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeMonthlyInsightCardProps {
  text: string;
}

export default function HomeMonthlyInsightCard({ text }: HomeMonthlyInsightCardProps) {
  const cardStyle = {
    gap: wp(12),
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.insightBackground,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginTop: hp(18),
  } as const;

  const textStyle = {
    fontSize: fp(15),
    lineHeight: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.insightText,
  } as const;

  return (
    <View className="flex-row items-center" style={cardStyle}>
      <Ionicons name="bar-chart-outline" size={wp(22)} color={COLORS.primary} />
      <Text className="flex-1" style={textStyle}>{text}</Text>
    </View>
  );
}
