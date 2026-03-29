import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface AiFeatureCarouselCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
}

export default function AiFeatureCarouselCard({
  title,
  description,
  children,
  compact,
}: AiFeatureCarouselCardProps) {
  const { height } = useWindowDimensions();
  const isCompactHeight = compact ?? height < 760;

  return (
    <View
      className="items-center justify-center bg-white"
      style={{
        width: '100%',
        maxWidth: 360,
        height: isCompactHeight ? hp(276) : hp(300),
        alignSelf: 'center',
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        padding: isCompactHeight ? wp(20) : wp(24),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View style={{ marginBottom: isCompactHeight ? hp(12) : hp(20) }}>{children}</View>
      <Text
        className="text-center"
        style={{
          fontSize: isCompactHeight ? fp(18) : fp(20),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
          marginBottom: isCompactHeight ? hp(10) : hp(12),
        }}
      >
        {title}
      </Text>
      <Text
        className="text-center"
        style={{
          fontSize: isCompactHeight ? fp(14) : fp(15),
          fontFamily: FONTS.regular,
          color: COLORS.textSecondary,
          lineHeight: isCompactHeight ? fp(20) : fp(22),
          paddingHorizontal: isCompactHeight ? wp(4) : wp(10),
        }}
      >
        {description}
      </Text>
    </View>
  );
}
