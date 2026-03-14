import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface SheetIconHeaderProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  title: string;
}

/**
 * 메인 홈 바텀시트 상단에서 공통으로 쓰는 아이콘 헤더.
 * 아이콘과 타이틀 톤을 고정해 시트마다 문구만 바꿔 재사용한다.
 */
export default function SheetIconHeader({
  iconName,
  eyebrow,
  title,
}: SheetIconHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={wp(26)} color={COLORS.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(14),
  },
  iconWrap: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEBFF',
  },
  textBlock: { flex: 1 },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
});
