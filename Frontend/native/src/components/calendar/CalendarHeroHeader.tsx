import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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
      style={{ marginBottom: hp(24) }}
    >
      <View className="flex-row items-center" style={{ gap: wp(6) }}>
        <Text
          style={{
            fontSize: fp(22),
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
          paddingHorizontal: wp(16),
          paddingVertical: hp(10),
        }}
      >
        <Text
          style={{
            fontSize: fp(14),
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
