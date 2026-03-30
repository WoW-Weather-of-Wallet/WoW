import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, TYPOGRAPHY } from '../../constants/theme';

type HomeTodayWeatherHeaderProps = {
  WeatherIcon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  dateLabel: string;
  typeLabel: string;
  iconSize: number;
};

export default function HomeTodayWeatherHeader({
  WeatherIcon,
  color,
  dateLabel,
  typeLabel,
  iconSize,
}: HomeTodayWeatherHeaderProps) {
  return (
    <View className="flex-row items-center">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
        <WeatherIcon size={iconSize} color={color} />
      </View>

      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            style={{
              fontSize: TYPOGRAPHY.label.fontSize,
              lineHeight: TYPOGRAPHY.label.lineHeight,
              fontFamily: FONTS.medium,
              color: COLORS.calendarHeroLabel,
            }}
          >
            오늘의 소비 날씨
          </Text>
          <Text
            style={{
              fontSize: TYPOGRAPHY.heroMeta.fontSize,
              lineHeight: TYPOGRAPHY.heroMeta.lineHeight,
              fontFamily: FONTS.semiBold,
              color: COLORS.calendarHeroSubText,
            }}
          >
            {dateLabel}
          </Text>
        </View>
        <View className="mt-1 flex-row items-baseline">
          <Text
            style={{
              fontSize: TYPOGRAPHY.heroTitle.fontSize,
              lineHeight: TYPOGRAPHY.heroTitle.lineHeight,
              fontFamily: FONTS.bold,
              color: COLORS.white,
            }}
          >
            {typeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
