import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { LegendListItem } from '../../constants/main/types';

interface LegendListProps {
  items: LegendListItem[];
  variant?: 'plain' | 'divider';
}

// 범례는 레이더 차트와 월간 비교 시트에서 공통으로 재사용합니다.
export default function LegendList({
  items,
  variant = 'plain',
}: LegendListProps) {
  return (
    <View style={[styles.container, variant === 'divider' && styles.dividerContainer]}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.left}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: hp(10),
  },
  dividerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: hp(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  dot: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  label: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  value: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
  },
});
