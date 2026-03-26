import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface CalendarHeroWeatherCardProps {
  weatherIconName: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
}

export default function CalendarHeroWeatherCard({
  weatherIconName,
  title,
  hint,
}: CalendarHeroWeatherCardProps) {
  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: COLORS.whiteOverlay14,
        borderRadius: RADIUS.xl,
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
        marginBottom: hp(16),
      }}
    >
      <View
        className="items-center justify-center"
        style={{ width: wp(38), marginRight: wp(10) }}
      >
        <Ionicons name={weatherIconName} size={wp(25)} color={COLORS.weatherSun} />
      </View>
      <View className="flex-1">
        <Text
          style={{
            fontSize: fp(17),
            fontFamily: FONTS.bold,
            color: COLORS.white,
            marginBottom: hp(4),
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: fp(12),
            fontFamily: FONTS.medium,
            color: COLORS.calendarHeroSubText,
          }}
        >
          {hint}
        </Text>
      </View>
    </View>
  );
}
