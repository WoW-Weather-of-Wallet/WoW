import React from 'react';
import { Text, View, useWindowDimensions, type DimensionValue } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { ResponsiveLayoutMode } from '../../hooks/useResponsiveLayoutMode';

interface AiFeatureCarouselCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
  width?: DimensionValue;
  layoutMode?: ResponsiveLayoutMode;
}

export default function AiFeatureCarouselCard({
  title,
  description,
  children,
  compact,
  width,
  layoutMode,
}: AiFeatureCarouselCardProps) {
  const { height } = useWindowDimensions();
  const resolvedLayoutMode = layoutMode ?? ((compact ?? height < 760) ? 'compact' : 'regular');
  const isCompactHeight = resolvedLayoutMode === 'compact';
  const isTallHeight = resolvedLayoutMode === 'tall';

  return (
    <View
      className="items-center bg-white"
      style={{
        width: width ?? '100%',
        maxWidth: 360,
        minHeight: isCompactHeight ? hp(264) : isTallHeight ? hp(286) : hp(278),
        alignSelf: 'center',
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        paddingHorizontal: isCompactHeight ? wp(18) : wp(22),
        paddingTop: isCompactHeight ? hp(18) : hp(20),
        paddingBottom: isCompactHeight ? hp(20) : hp(22),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View
        style={{
          minHeight: isCompactHeight ? hp(104) : hp(116),
          marginBottom: isCompactHeight ? hp(10) : hp(14),
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
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
