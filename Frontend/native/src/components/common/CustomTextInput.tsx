import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

interface CustomTextInputProps extends RNTextInputProps {
  label: string;
  containerStyle?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * CustomTextInput - 포커스 애니메이션이 있는 커스텀 인풋
 * 포커스 시 보더 색상이 테마 컬러로 부드럽게 전환
 */
export default function CustomTextInput({
  label,
  containerStyle,
  secureTextEntry,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [COLORS.border, COLORS.borderFocus]
    );
    return { borderColor };
  });

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  };

  return (
    <AnimatedView style={[styles.container, animatedBorderStyle, containerStyle]}>
      <RNTextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor={COLORS.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        {...props}
      />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(20),
    paddingVertical: hp(4),
  },
  input: {
    fontSize: fp(15),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: hp(14),
  },
});
