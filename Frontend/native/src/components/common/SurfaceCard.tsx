import React, { PropsWithChildren } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

interface SurfaceCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export default function SurfaceCard({ children, style }: SurfaceCardProps) {
  return (
    <View
      className="bg-white"
      style={[
        {
          backgroundColor: COLORS.background,
          borderRadius: RADIUS.xxl,
          padding: wp(18),
          borderWidth: 1,
          borderColor: COLORS.surfaceBorder,
          gap: hp(12),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
