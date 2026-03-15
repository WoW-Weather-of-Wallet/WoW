import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, fp, wp } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
}

/**
 * SectionHeader
 * 리스트/카드 섹션 상단의 제목과 보조 액션을 동일한 톤으로 보여줍니다.
 */
export default function SectionHeader({ title, actionLabel }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? <Text style={styles.action}>{actionLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  title: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  action: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
