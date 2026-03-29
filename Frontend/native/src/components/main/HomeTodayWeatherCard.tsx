import React, { useMemo, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { wp } from '../../constants/theme';
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
  const dateString = `${today.getMonth() + 1}/${today.getDate()}`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayString = dayNames[today.getDay()];
  const WeatherIcon = weatherData.icon;

  return (
    <View className="overflow-hidden rounded-3xl bg-primary shadow-sm" style={style}>
      <View className="bg-primary-light/10 p-5" style={{ flex: 1, justifyContent: 'space-between' }}>
        <HomeTodayWeatherHeader
          WeatherIcon={WeatherIcon}
          color={weatherData.color}
          dateLabel={`${dateString} (${dayString})`}
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
    </View>
  );
}
