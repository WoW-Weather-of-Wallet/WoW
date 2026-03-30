import React, { useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, RADIUS, wp } from '../../constants/theme';
import {
  buildHomeWeatherVisual,
  HOME_WEATHER_GUIDE,
} from '../../utils/homeWeatherPresentation';
import HomeTodayWeatherHeader from './HomeTodayWeatherHeader';
import HomeTodayWeatherHintRow from './HomeTodayWeatherHintRow';
import HomeWeatherGuideModal from './HomeWeatherGuideModal';

interface HomeTodayWeatherCardProps {
  weatherName?: string | null;
  description?: string | null;
  iconCode?: string | null;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function HomeTodayWeatherCard({
  weatherName,
  description,
  iconCode,
  isLoading = false,
  style,
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
  const yearString = String(today.getFullYear());
  const monthString = String(today.getMonth() + 1).padStart(2, '0');
  const dateString = String(today.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayString = dayNames[today.getDay()];
  const WeatherIcon = weatherData.icon;

  return (
    <LinearGradient
      colors={[COLORS.calendarHeroStart, COLORS.calendarHeroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          overflow: 'hidden',
          borderRadius: RADIUS.xxl,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          padding: 20,
          backgroundColor: COLORS.whiteOverlay14,
        }}
      >
        <HomeTodayWeatherHeader
          WeatherIcon={WeatherIcon}
          color={weatherData.color}
          dateLabel={`${yearString}년 ${monthString}월 ${dateString}일 (${dayString})`}
          typeLabel={weatherData.type}
          iconSize={wp(36)}
        />

        <HomeTodayWeatherHintRow
          hint={weatherData.hint}
          infoIconSize={wp(18)}
          onPressInfo={() => setModalVisible(true)}
        />
      </View>

      <HomeWeatherGuideModal
        visible={modalVisible}
        items={HOME_WEATHER_GUIDE}
        onClose={() => setModalVisible(false)}
      />
    </LinearGradient>
  );
}
