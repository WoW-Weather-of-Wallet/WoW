import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../constants/theme';
import {
  buildHomeWeatherVisual,
  HOME_WEATHER_GUIDE,
} from '../../utils/homeWeatherPresentation';
import HomeWeatherGuideModal from './HomeWeatherGuideModal';

interface HomeTodayWeatherCardProps {
  weatherName?: string | null;
  description?: string | null;
  iconCode?: string | null;
  isLoading?: boolean;
}

export default function HomeTodayWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
}: HomeTodayWeatherCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const weatherData = useMemo(() => {
    return buildHomeWeatherVisual({
      weatherName,
      description,
      iconCode,
      isLoading,
    });
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

      <HomeWeatherGuideModal
        visible={modalVisible}
        items={HOME_WEATHER_GUIDE}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
