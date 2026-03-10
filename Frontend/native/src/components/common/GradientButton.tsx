import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * GradientButton - 그라데이션/아웃라인 버튼 컴포넌트
 * variant="solid": 그라데이션 배경 + 흰색 텍스트
 * variant="outline": 테두리 + 테마 컬러 텍스트
 */
export default function GradientButton({
  title,
  onPress,
  variant = 'solid',
  style,
  textStyle,
  disabled = false,
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  if (variant === 'outline') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled}
        style={[animatedStyle, styles.outlineButton, style]}
      >
        <Text style={[styles.outlineText, textStyle]}>{title}</Text>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.solidButton}
      >
        <Text style={[styles.solidText, textStyle]}>{title}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  solidButton: {
    paddingVertical: hp(16),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidText: {
    color: COLORS.textInverse,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
  outlineButton: {
    paddingVertical: hp(16),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  outlineText: {
    color: COLORS.textPrimary,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
});
