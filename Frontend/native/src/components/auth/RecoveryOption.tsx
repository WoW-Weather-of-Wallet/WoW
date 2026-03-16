import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface RecoveryOptionProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

/**
 * 아이디 또는 비밀번호 찾기 선택 항목을 위한 카드 컴포넌트입니다.
 * 직관적인 아이콘과 설명을 포함하여 사용자 경험을 개선합니다.
 */
export default function RecoveryOption({
  title,
  description,
  icon,
  onPress,
}: RecoveryOptionProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={wp(24)} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={wp(20)} color={COLORS.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: wp(20),
    borderRadius: RADIUS.xl,
    marginBottom: hp(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // 그림자 효과로 입체감 부여
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(16),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  description: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
});

