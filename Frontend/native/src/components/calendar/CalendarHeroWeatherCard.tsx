import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
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
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
        marginBottom: hp(16),
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
            fontSize: fp(17),
            fontFamily: FONTS.bold,
            color: COLORS.white,
            marginBottom: hp(4),
          }}
          >
          {weatherVisual.type}
        </Text>
        <Text
          style={{
            fontSize: fp(12),
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
