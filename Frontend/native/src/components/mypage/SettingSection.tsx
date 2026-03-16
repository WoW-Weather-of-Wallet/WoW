import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface SettingSectionProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * 설정 항목들을 논리적인 그룹으로 묶어주는 섹션 컴포넌트입니다.
 */
export default function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
  },
  sectionTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
    marginLeft: wp(22),
    marginBottom: hp(8),
    textTransform: 'uppercase',
  },
  content: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
});
