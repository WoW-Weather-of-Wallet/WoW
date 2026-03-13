import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface DevShortcutButtonProps {
  label: string;
  description?: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * DevShortcutButton
 * API 안정화 전까지 흐름을 막지 않기 위해 두는 우회 버튼입니다.
 * 현재는 개발/배포 모드와 관계없이 렌더링합니다.
 */
export default function DevShortcutButton({
  label,
  description,
  onPress,
  style,
}: DevShortcutButtonProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.badge}>DEV ONLY</Text>
      <Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>바로 이동</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: hp(16),
    padding: wp(16),
    borderRadius: wp(16),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
    backgroundColor: '#FFF7ED',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: wp(999),
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    fontSize: fp(11),
    fontFamily: FONTS.bold,
    marginBottom: hp(10),
  },
  label: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: '#9A3412',
    marginBottom: hp(6),
  },
  description: {
    fontSize: fp(13),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(12),
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(12),
    paddingVertical: hp(10),
    borderRadius: wp(10),
    backgroundColor: '#1A1A1A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
  },
});
