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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: hp(10),
        columnGap: wp(10),
      }}
    >
      <View
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
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
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
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
          flexShrink: 1,
          maxWidth: '100%',
          backgroundColor: COLORS.whiteOverlay1E,
          borderRadius: RADIUS.full,
          paddingHorizontal: wp(12),
          paddingVertical: hp(8),
        }}
      >
        <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
        <Text
          numberOfLines={2}
          style={{
            fontSize: fp(12),
            lineHeight: fp(16),
            fontFamily: FONTS.semiBold,
            color: COLORS.white,
            flexShrink: 1,
          }}
        >
          {goalLabel}
        </Text>
      </View>
    </View>
  );
}
