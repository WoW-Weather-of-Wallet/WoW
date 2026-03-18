import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './RecoveryOption.styles';

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


