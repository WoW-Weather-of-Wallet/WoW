import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface AiFeatureCarouselCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AiFeatureCarouselCard({
  title,
  description,
  children,
}: AiFeatureCarouselCardProps) {
  return (
    <View
      className="items-center justify-center bg-white"
      style={{
        width: wp(310),
        maxWidth: 340,
        height: hp(300),
        marginRight: wp(16),
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        padding: wp(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View style={{ marginBottom: hp(20) }}>{children}</View>
      <Text
        className="text-center"
        style={{
          fontSize: fp(20),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
          marginBottom: hp(12),
        }}
      >
        {title}
      </Text>
      <Text
        className="text-center"
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.regular,
          color: COLORS.textSecondary,
          lineHeight: fp(22),
          paddingHorizontal: wp(10),
        }}
      >
        {description}
      </Text>
    </View>
  );
}
