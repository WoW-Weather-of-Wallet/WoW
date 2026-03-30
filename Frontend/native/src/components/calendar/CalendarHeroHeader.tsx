import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, TYPOGRAPHY, hp, wp } from '../../constants/theme';

interface CalendarHeroHeaderProps {
  title: string;
  addLabel: string;
  onPressAdd?: () => void;
  onPressInfo?: () => void;
}

export default function CalendarHeroHeader({
  title,
  addLabel,
  onPressAdd,
  onPressInfo,
}: CalendarHeroHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ marginBottom: hp(14) }}
    >
      <View className="flex-row items-center" style={{ gap: wp(6) }}>
        <Text
          style={{
            fontSize: TYPOGRAPHY.heroSection.fontSize,
            lineHeight: TYPOGRAPHY.heroSection.lineHeight,
            fontFamily: FONTS.bold,
            color: COLORS.white,
          }}
        >
          {title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="items-center justify-center"
          style={{ padding: wp(4) }}
          onPress={onPressInfo}
        >
          <Ionicons
            name="information-circle-outline"
            size={wp(18)}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPressAdd}
        style={{
          borderWidth: 1,
          borderColor: COLORS.whiteOverlay3A,
          backgroundColor: COLORS.whiteOverlay14,
          borderRadius: RADIUS.full,
          paddingHorizontal: wp(14),
          paddingVertical: hp(8),
        }}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.label.fontSize,
            lineHeight: TYPOGRAPHY.label.lineHeight,
            fontFamily: FONTS.semiBold,
            color: COLORS.white,
          }}
        >
          {addLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
