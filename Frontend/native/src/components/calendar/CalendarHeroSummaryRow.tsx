import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface CalendarHeroSummaryRowProps {
  label: string;
  amountText: string;
  goalLabel: string;
}

export default function CalendarHeroSummaryRow({
  label,
  amountText,
  goalLabel,
}: CalendarHeroSummaryRowProps) {
  return (
    <View className="flex-row items-end justify-between">
      <View>
        <Text
          style={{
            fontSize: fp(12),
            fontFamily: FONTS.medium,
            color: COLORS.calendarHeroLabel,
            marginBottom: hp(6),
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: fp(20),
            fontFamily: FONTS.bold,
            color: COLORS.white,
          }}
        >
          {amountText}
        </Text>
      </View>

      <View
        className="flex-row items-center"
        style={{
          gap: wp(4),
          backgroundColor: COLORS.whiteOverlay1E,
          borderRadius: RADIUS.full,
          paddingHorizontal: wp(14),
          paddingVertical: hp(9),
        }}
      >
        <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
        <Text
          style={{
            fontSize: fp(12),
            fontFamily: FONTS.semiBold,
            color: COLORS.white,
          }}
        >
          {goalLabel}
        </Text>
      </View>
    </View>
  );
}
