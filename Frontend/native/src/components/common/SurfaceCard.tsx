import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

interface SurfaceCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

/**
 * SurfaceCard
 * 화면 전반에서 반복되는 기본 카드 표면을 공통화합니다.
 * 카드 여백과 모서리, 보더 톤을 한 곳에서 관리해 화면별 미세한 차이를 줄입니다.
 */
export default function SurfaceCard({ children, style }: SurfaceCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(18),
    borderWidth: 1,
    borderColor: '#E7EAFA',
    gap: hp(12),
  },
});
