import React, { useEffect, useMemo, useState } from 'react';
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
  hint: React.ReactNode;
  icon: typeof SunnyIcon;
};

const FALLBACK_WEATHERS: WeatherVisual[] = [
  {
    type: '맑음',
    hint: (
      <Text>
        지출 관리의 정석! <Text className="font-sans-extrabold text-white">맑은 날씨</Text>가
        계속될 거예요.
      </Text>
    ),
    icon: SunnyIcon,
  },
  {
    type: '구름',
    hint: (
      <Text>
        구름 낀 날씨네요. <Text className="font-sans-extrabold text-white">조금만 더 신경 쓰면</Text>{' '}
        맑아질 거예요.
      </Text>
    ),
    icon: CloudyIcon,
  },
  {
    type: '흐림',
    hint: (
      <Text>
        흐린 날씨예요. <Text className="font-sans-extrabold text-white">불필요한 지출</Text>이
        없는지 확인해 보세요.
      </Text>
    ),
    icon: OvercastIcon,
  },
  {
    type: '비',
    hint: (
      <Text>
        비가 내리고 있어요! <Text className="font-sans-extrabold text-white">꼭 필요한 지출만</Text>{' '}
        하는 것이 좋겠어요.
      </Text>
    ),
    icon: RainIcon,
  },
  {
    type: '폭우',
    hint: (
      <Text>
        폭우 경보! <Text className="font-sans-extrabold text-white">우산(비상금)</Text>이 젖기 전에
        지출을 멈춰주세요!
      </Text>
    ),
    icon: HeavyRainIcon,
  },
];

const WEATHER_GUIDE = [
  { type: '맑음', detail: '최근 평균 대비 10% 이하', icon: SunnyIcon, color: '#F59E0B' },
  { type: '구름', detail: '최근 평균 대비 10~20%', icon: CloudyIcon, color: '#94A3B8' },
  { type: '흐림', detail: '최근 평균 대비 20~30%', icon: OvercastIcon, color: '#64748B' },
  { type: '비', detail: '최근 평균 대비 30~50%', icon: RainIcon, color: '#3B82F6' },
  { type: '폭우', detail: '최근 평균 대비 50% 초과', icon: HeavyRainIcon, color: '#1E3A8A' },
] as const;

export default function HomeTodayWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
}: HomeTodayWeatherCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [fallbackWeather, setFallbackWeather] = useState<WeatherVisual | null>(null);

  useEffect(() => {
    if (weatherName || description || iconCode || isLoading) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * FALLBACK_WEATHERS.length);
    setFallbackWeather(FALLBACK_WEATHERS[randomIndex]);
  }, [description, iconCode, isLoading, weatherName]);

  const weatherData = useMemo(() => {
    if (isLoading) {
      return {
        type: '불러오는 중',
        hint: '오늘의 소비 날씨를 준비하고 있어요.',
        icon: CloudyIcon,
      } satisfies WeatherVisual;
    }

    return resolveWeatherVisual(iconCode, weatherName, description) ?? fallbackWeather;
  }, [description, fallbackWeather, iconCode, isLoading, weatherName]);

  if (!weatherData) {
    return null;
  }

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
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-white/80">오늘의 소비날씨</Text>
              <Text className="text-sm font-semibold text-white/70">
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
            <Text className="mb-2 text-xl font-bold text-gray-800">소비날씨란?</Text>
            <Text className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
              최근 3개월 지출 평균과 이번 달의 실시간 지출을 비교해 하루의 날씨로 표현합니다!
            </Text>

            <View className="space-y-4">
              {WEATHER_GUIDE.map((item) => {
                const GuideIcon = item.icon;

                return (
                  <View key={item.type} className="mb-3 flex-row items-center">
                    <View className="w-10 items-center justify-center">
                      <GuideIcon size={24} color={item.color} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-bold text-gray-800">{item.type}</Text>
                      <Text className="text-xs text-gray-400">
                        <Text className="font-semibold text-gray-600">{item.detail}</Text>
                      </Text>
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
): WeatherVisual | null {
  if (!iconCode && !weatherName && !description) {
    return null;
  }

  const normalizedCode = iconCode?.toLowerCase() ?? '';
  const normalizedName = weatherName?.trim() ?? '';
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

  if (
    normalizedCode.includes('overcast') ||
    normalizedCode.includes('gray') ||
    normalizedName.includes('흐림')
  ) {
    return {
      type: normalizedName || '흐림',
      hint,
      icon: OvercastIcon,
    };
  }

  if (normalizedCode.includes('cloud') || normalizedName.includes('구름')) {
    return {
      type: normalizedName || '구름',
      hint,
      icon: CloudyIcon,
    };
  }

  if (
    normalizedCode.includes('sun') ||
    normalizedCode.includes('clear') ||
    normalizedName.includes('맑')
  ) {
    return {
      type: normalizedName || '맑음',
      hint,
      icon: SunnyIcon,
    };
  }

  return {
    type: normalizedName || '소비날씨',
    hint,
    icon: CloudyIcon,
  };
}
