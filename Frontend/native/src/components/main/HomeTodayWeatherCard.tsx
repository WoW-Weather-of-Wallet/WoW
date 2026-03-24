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
  hint: React.ReactNode;
  icon: typeof SunnyIcon;
  color: string; // [UX-Fix] 모달 가이드와 통일된 색상 정보 추가
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
    color: '#F59E0B',
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
    color: '#FFFFFF', // [User-Request] 회색에서 흰색으로 변경
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
    color: '#64748B',
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
    color: '#1AABFF', // 메인 카드 배경색(primary)과 구분되도록 약간 밝은 블루 적용
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
    color: '#1E3A8A',
  },
];

// 안내 모달용 가이드 데이터
const WEATHER_GUIDE = [
  { type: '맑음', detail: '최근 평균 대비 10% 이하', icon: SunnyIcon, color: '#F59E0B' },
  { type: '구름', detail: '최근 평균 대비 10~20%', icon: CloudyIcon, color: '#FFFFFF' }, // 회색에서 흰색으로 변경
  { type: '흐림', detail: '최근 평균 대비 20~30%', icon: OvercastIcon, color: '#64748B' },
  { type: '비', detail: '최근 평균 대비 30~50%', icon: RainIcon, color: '#1AABFF' },
  { type: '폭우', detail: '최근 평균 대비 50% 초과', icon: HeavyRainIcon, color: '#1E3A8A' },
];

export default function HomeTodayWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
}: HomeTodayWeatherCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const weatherData = useMemo(() => {
    if (isLoading) {
      return {
        type: '불러오는 중',
        hint: '오늘 소비 날씨를 확인하고 있습니다.',
        icon: CloudyIcon,
        color: '#FFFFFF',
      } satisfies WeatherVisual;
    }

    return (
      resolveWeatherVisual(iconCode, weatherName, description) ?? {
        type: '-',
        hint: '-',
        icon: CloudyIcon,
        color: '#FFFFFF', // [UX-Fix] 필수 속성인 color 추가 (CloudyIcon 기본색)
      }
    );
  }, [description, iconCode, isLoading, weatherName]);

  const today = new Date();
  const dateString = `${today.getMonth() + 1}/${today.getDate()}`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayString = dayNames[today.getDay()];
  const WeatherIcon = weatherData.icon;

  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-primary shadow-sm">
      <View className="bg-primary-light/10 p-5">
        <View className="flex-row items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            {/* [UX-Fix] 모달과 동일한 유색 아이콘을 출력하여 시각적 통일성 부여 */}
            <WeatherIcon size={wp(36)} color={weatherData.color} />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-white/80">오늘 소비 날씨</Text>
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
            <Text className="mb-2 text-xl font-bold text-gray-800">소비 날씨 안내</Text>
            <Text className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
              최근 소비 흐름을 바탕으로 현재 소비 상태를 날씨처럼 보여줍니다.
            </Text>

            <View className="space-y-4">
              {WEATHER_GUIDE.map((item) => {
                const GuideIcon = item.icon;

                return (
                  <View key={item.type} className="mb-6 flex-row items-center">
                    {/* [UX-Fix] 이미지 크기를 키워 시각적 전달력 강화 (h-10 -> h-14) */}
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <GuideIcon size={wp(28)} color={item.color} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-gray-800">{item.type}</Text>
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
              <Text className="text-base font-bold text-white">닫기</Text>
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
  const hint = description?.trim() || '-';

  if (normalizedCode.includes('heavy') || normalizedName.includes('폭우')) {
    return {
      type: normalizedName || '폭우',
      hint,
      icon: HeavyRainIcon,
      color: '#1E3A8A',
    };
  }

  if (normalizedCode.includes('rain') || normalizedName.includes('비')) {
    return {
      type: normalizedName || '비',
      hint,
      icon: RainIcon,
      color: '#1AABFF',
    };
  }

  if (
    normalizedCode.includes('overcast') ||
    normalizedCode.includes('gray') ||
    normalizedName.includes('구름')
  ) {
    return {
      type: normalizedName || '흐림',
      hint,
      icon: OvercastIcon,
      color: '#64748B',
    };
  }

  if (normalizedCode.includes('cloud') || normalizedName.includes('구름')) {
    return {
      type: normalizedName || '구름',
      hint,
      icon: CloudyIcon,
      color: '#FFFFFF',
    };
  }

  if (
    normalizedCode.includes('sun') ||
    normalizedCode.includes('clear') ||
    normalizedName.includes('맑음')
  ) {
    return {
      type: normalizedName || '맑음',
      hint,
      icon: SunnyIcon,
      color: '#F59E0B',
    };
  }

  return {
    type: normalizedName || '소비날씨',
    hint,
    icon: CloudyIcon,
    color: '#FFFFFF',
  };
}
