import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useSharedValue(0);
  const shouldShowPasswordToggle = Boolean(secureTextEntry);
  const resolvedSecureTextEntry = shouldShowPasswordToggle
    ? !isPasswordVisible
    : secureTextEntry;

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
    <AnimatedView
      style={[
        {
          borderWidth: 1.5,
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.background,
          paddingHorizontal: wp(20),
          paddingVertical: hp(4),
        },
        animatedBorderStyle,
        containerStyle,
      ]}
    >
      <RNTextInput
        className="font-sans text-text"
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.regular,
          color: COLORS.textPrimary,
          paddingVertical: hp(14),
          paddingRight: shouldShowPasswordToggle ? wp(40) : 0,
        }}
        accessibilityLabel={label}
        accessibilityHint={`${label} 입력`}
        placeholder={label}
        placeholderTextColor={COLORS.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={resolvedSecureTextEntry}
        autoCapitalize="none"
        {...props}
      />
      {shouldShowPasswordToggle ? (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? `${label} 숨기기` : `${label} 보기`}
          style={{
            position: 'absolute',
            right: wp(14),
            top: '50%',
            marginTop: -wp(10),
            padding: wp(4),
          }}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={wp(20)}
            color={isPasswordVisible ? COLORS.primary : COLORS.textTertiary}
          />
        </TouchableOpacity>
      ) : null}
    </AnimatedView>
  );
}
