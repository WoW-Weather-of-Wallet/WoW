import React from 'react';
import { Text, View } from 'react-native';

import { wp } from '../../constants/theme';
import type { HomeWeatherGuideItem } from '../../utils/homeWeatherPresentation';

type HomeWeatherGuideItemRowProps = {
  item: HomeWeatherGuideItem;
};

export default function HomeWeatherGuideItemRow({
  item,
}: HomeWeatherGuideItemRowProps) {
  const GuideIcon = item.icon;

  return (
    <View className="mb-6 flex-row items-center">
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
}
