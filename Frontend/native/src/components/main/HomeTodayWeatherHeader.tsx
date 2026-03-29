import React from 'react';
import { Text, View } from 'react-native';

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
          <Text className="text-sm font-medium text-white/80">오늘의 소비 날씨</Text>
          <Text className="text-base font-semibold text-white/75">{dateLabel}</Text>
        </View>
        <View className="mt-1 flex-row items-baseline">
          <Text className="text-3xl font-bold text-white">{typeLabel}</Text>
        </View>
      </View>
    </View>
  );
}
