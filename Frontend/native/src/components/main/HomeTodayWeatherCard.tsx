import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../constants/theme';
import SunnyIcon from '../../../assets/imgs/weather/SunnyIcon';
import CloudyIcon from '../../../assets/imgs/weather/CloudyIcon';
import OvercastIcon from '../../../assets/imgs/weather/OvercastIcon';
import RainIcon from '../../../assets/imgs/weather/RainIcon';
import HeavyRainIcon from '../../../assets/imgs/weather/HeavyRainIcon';

interface HomeTodayWeatherCardProps {
  weatherName?: string | null;
  description?: string | null;
  iconCode?: string | null;
  isLoading?: boolean;
}

type WeatherVisual = {
  type: string;
  hint: string;
  icon: typeof SunnyIcon;
};

const WEATHER_GUIDE = [
  {
    type: '맑음',
    hint: '지출 관리의 적정선! 맑은 소비 흐름이 이어지고 있어요.',
    icon: SunnyIcon,
  },
  {
    type: '구름',
    hint: '약간의 주의가 필요한 흐름이에요. 조금만 더 점검하면 좋아질 수 있어요.',
    icon: CloudyIcon,
  },
  {
    type: '흐림',
    hint: '불안정한 지출 흐름이 보여요. 최근 소비 패턴을 한 번 점검해보세요.',
    icon: OvercastIcon,
  },
  {
    type: '비',
    hint: '예산을 조금 더 조심해서 볼 시점이에요. 필요한 지출 위주로 정리해보세요.',
    icon: RainIcon,
  },
  {
    type: '폭우',
    hint: '지출 관리가 많이 흔들리고 있어요. 이번 주에는 큰 소비를 잠시 쉬는 게 좋아요.',
    icon: HeavyRainIcon,
  },
] as const;

export default function HomeTodayWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
}: HomeTodayWeatherCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const weatherData = useMemo(
    () => resolveWeatherVisual(iconCode, weatherName, description, isLoading),
    [description, iconCode, isLoading, weatherName],
  );

  const today = new Date();
  const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayString = `${dayNames[today.getDay()]}요일`;
  const WeatherIcon = weatherData.icon;

  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-primary shadow-sm">
      <View className="bg-primary-light/10 p-5">
        <View className="flex-row items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <WeatherIcon size={wp(36)} color="#FFFFFF" />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-white/80">오늘의 소비 날씨</Text>
              <Text className="ml-2 text-xs font-semibold text-white/60">
                {dateString} {dayString}
              </Text>
            </View>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-3xl font-bold text-white">{weatherData.type}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row items-center rounded-xl bg-white/10 p-3">
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="items-center justify-center p-1"
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={wp(18)} color="white" />
          </TouchableOpacity>
          <Text className="ml-2 flex-1 text-sm text-white/90" numberOfLines={2}>
            {weatherData.hint}
          </Text>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 p-6"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="w-full rounded-3xl bg-white p-6 shadow-lg">
            <Text className="mb-2 text-xl font-bold text-gray-800">소비 날씨 안내</Text>
            <Text className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
              최근 소비 흐름과 현재 지출 패턴을 비교해 소비 날씨로 보여줍니다.
            </Text>

            <View className="space-y-4">
              {WEATHER_GUIDE.map((item) => {
                const GuideIcon = item.icon;

                return (
                  <View key={item.type} className="mb-3 flex-row items-center">
                    <View className="w-10 items-center justify-center">
                      <GuideIcon size={24} color="#FFFFFF" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-bold text-gray-800">{item.type}</Text>
                      <Text className="text-xs text-gray-500">{item.hint}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              className="mt-6 items-center rounded-xl bg-primary py-4"
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text className="text-base font-bold text-white">확인</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function resolveWeatherVisual(
  iconCode?: string | null,
  weatherName?: string | null,
  description?: string | null,
  isLoading?: boolean,
): WeatherVisual {
  if (isLoading) {
    return {
      type: '불러오는 중',
      hint: '오늘의 소비 날씨를 준비하고 있어요.',
      icon: CloudyIcon,
    };
  }

  const normalizedCode = iconCode?.toLowerCase() ?? '';
  const normalizedName = weatherName ?? '';
  const hint = description?.trim() || '오늘의 소비 흐름을 한눈에 확인해보세요.';

  if (normalizedCode.includes('heavy') || normalizedName.includes('폭우')) {
    return {
      type: normalizedName || '폭우',
      hint,
      icon: HeavyRainIcon,
    };
  }

  if (normalizedCode.includes('rain') || normalizedName.includes('비')) {
    return {
      type: normalizedName || '비',
      hint,
      icon: RainIcon,
    };
  }

  if (normalizedCode.includes('cloud') || normalizedName.includes('흐림')) {
    return {
      type: normalizedName || '흐림',
      hint,
      icon: OvercastIcon,
    };
  }

  if (normalizedCode.includes('clear') || normalizedName.includes('구름')) {
    return {
      type: normalizedName || '구름',
      hint,
      icon: CloudyIcon,
    };
  }

  if (normalizedCode.includes('sun') || normalizedName.includes('맑')) {
    return {
      type: normalizedName || '맑음',
      hint,
      icon: SunnyIcon,
    };
  }

  return {
    type: normalizedName || '소비 날씨',
    hint,
    icon: CloudyIcon,
  };
}
