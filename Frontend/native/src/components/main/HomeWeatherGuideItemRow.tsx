import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, TYPOGRAPHY, wp } from '../../constants/theme';
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
        <Text
          style={{
            fontSize: TYPOGRAPHY.title.fontSize,
            lineHeight: TYPOGRAPHY.title.lineHeight,
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
          }}
        >
          {item.type}
        </Text>
        <Text
          style={{
            fontSize: TYPOGRAPHY.body.fontSize,
            lineHeight: TYPOGRAPHY.body.lineHeight,
            fontFamily: FONTS.regular,
            color: COLORS.textSecondary,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              color: COLORS.gray700,
            }}
          >
            {item.detail}
          </Text>
        </Text>
      </View>
    </View>
  );
}
