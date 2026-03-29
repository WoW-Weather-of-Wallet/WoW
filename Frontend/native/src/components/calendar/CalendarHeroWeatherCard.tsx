import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, TYPOGRAPHY, hp, wp } from '../../constants/theme';
import { buildHomeWeatherVisual } from '../../utils/homeWeatherPresentation';

interface CalendarHeroWeatherCardProps {
  weatherName: string;
  description: string;
  iconCode?: string | null;
  isLoading?: boolean;
}

export default function CalendarHeroWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
}: CalendarHeroWeatherCardProps) {
  const weatherVisual = useMemo(
    () =>
      buildHomeWeatherVisual({
        weatherName,
        description,
        iconCode,
        isLoading,
      }),
    [description, iconCode, isLoading, weatherName],
  );
  const WeatherIcon = weatherVisual.icon;

  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: COLORS.whiteOverlay14,
        borderRadius: RADIUS.xl,
        paddingHorizontal: wp(14),
        paddingVertical: hp(12),
        marginBottom: hp(10),
      }}
    >
      <View
        className="items-center justify-center"
        style={{ width: wp(38), marginRight: wp(10) }}
      >
        <WeatherIcon size={wp(25)} color={weatherVisual.color} />
      </View>
      <View className="flex-1">
        <Text
          style={{
            fontSize: TYPOGRAPHY.title.fontSize,
            lineHeight: TYPOGRAPHY.title.lineHeight,
            fontFamily: FONTS.bold,
            color: COLORS.white,
            marginBottom: hp(2),
          }}
          >
          {weatherVisual.type}
        </Text>
        <Text
          style={{
            fontSize: TYPOGRAPHY.caption.fontSize,
            lineHeight: TYPOGRAPHY.caption.lineHeight,
            fontFamily: FONTS.medium,
            color: COLORS.calendarHeroSubText,
          }}
        >
          {weatherVisual.hint}
        </Text>
      </View>
    </View>
  );
}
