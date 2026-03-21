import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../constants/theme';

/**
 * 오늘 날씨를 보여주는 카드 컴포넌트입니다.
 * NativeWind를 사용하여 스타일링하며, 프리미엄한 디자인을 위해 그라데이션 효과를 시뮬레이션합니다.
 */
export default function HomeTodayWeatherCard() {
  // TODO: 실제 데이터 연동 시 props로 전달받도록 수정 예정
  const todayWeather = {
    temp: '24°',
    condition: '구름 많음',
    hint: '어제보다 2도 높아요. 가벼운 외투를 챙기세요!',
    icon: 'partly-sunny' as const,
  };

  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-primary shadow-sm">
      {/* 카드 내부 배경 (그라데이션 느낌을 위한 불투명도 조절) */}
      <View className="bg-primary-light/10 p-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-medium text-white/80">오늘의 날씨</Text>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-4xl font-bold text-white">{todayWeather.temp}</Text>
              <Text className="ml-2 text-lg font-semibold text-white/90">
                {todayWeather.condition}
              </Text>
            </View>
          </View>

          {/* 날씨 아이콘 영역 */}
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Ionicons name={todayWeather.icon} size={wp(32)} color="white" />
          </View>
        </View>

        {/* 하단 힌트 영역 */}
        <View className="mt-4 flex-row items-center rounded-xl bg-white/10 p-3">
          <Ionicons name="information-circle-outline" size={wp(16)} color="white" />
          <Text className="ml-2 text-sm text-white/90" numberOfLines={1}>
            {todayWeather.hint}
          </Text>
        </View>
      </View>
    </View>
  );
}
