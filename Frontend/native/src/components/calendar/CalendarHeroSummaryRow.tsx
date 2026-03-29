import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, TYPOGRAPHY, hp, wp } from '../../constants/theme';

interface CalendarHeroSummaryRowProps {
  goalLabel: string;
}

export default function CalendarHeroSummaryRow({
  goalLabel,
}: CalendarHeroSummaryRowProps) {
  return (
    <View style={{ marginTop: 0 }}>
      <View
        className="flex-row items-center"
        style={{
          gap: wp(8),
          width: '100%',
          backgroundColor: COLORS.whiteOverlay1E,
          borderRadius: RADIUS.xl,
          paddingHorizontal: wp(14),
          paddingVertical: hp(10),
        }}
      >
        <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
        <Text
          numberOfLines={2}
          style={{
            fontSize: TYPOGRAPHY.caption.fontSize,
            lineHeight: TYPOGRAPHY.caption.lineHeight,
            fontFamily: FONTS.semiBold,
            color: COLORS.white,
            flexShrink: 1,
            textAlign: 'left',
          }}
        >
          {goalLabel}
        </Text>
      </View>
    </View>
  );
}
