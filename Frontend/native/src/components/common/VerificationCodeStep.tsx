import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import SecureKeypad from './SecureKeypad';

interface VerificationCodeStepProps {
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  titleStyle: StyleProp<TextStyle>;
  subtitleStyle: StyleProp<TextStyle>;
  dotsContainerStyle: StyleProp<ViewStyle>;
  dotStyle: StyleProp<ViewStyle>;
  dotFilledStyle: StyleProp<ViewStyle>;
  feedbackRowStyle: StyleProp<ViewStyle>;
  loadingTextStyle: StyleProp<TextStyle>;
  errorTextStyle: StyleProp<TextStyle>;
  successTextStyle?: StyleProp<TextStyle>;
  resendRowStyle?: StyleProp<ViewStyle>;
  resendTextStyle?: StyleProp<TextStyle>;
  keypadWrapperStyle: StyleProp<ViewStyle>;
  onBack?: () => void;
  backIconSize?: number;
  backIconColor?: string;
  loadingIndicatorColor?: string;
  successIconColor?: string;
  stepIndicator?: React.ReactNode;
  title: string;
  subtitle: string;
  code: string;
  codeLength: number;
  isVerifying: boolean;
  loadingText: string;
  verifyError?: string;
  isVerified?: boolean;
  successMessage?: string;
  isSending?: boolean;
  resendText?: string;
  resendingText?: string;
  onResend?: () => void;
  onPressNumber: (value: string) => void;
  onPressDelete: () => void;
  bottomAction?: React.ReactNode;
}

export default function VerificationCodeStep({
  containerStyle,
  contentStyle,
  backButtonStyle,
  titleStyle,
  subtitleStyle,
  dotsContainerStyle,
  dotStyle,
  dotFilledStyle,
  feedbackRowStyle,
  loadingTextStyle,
  errorTextStyle,
  successTextStyle,
  resendRowStyle,
  resendTextStyle,
  keypadWrapperStyle,
  onBack,
  backIconSize = 24,
  backIconColor = COLORS.textPrimary,
  loadingIndicatorColor = COLORS.primary,
  successIconColor = COLORS.success,
  stepIndicator,
  title,
  subtitle,
  code,
  codeLength,
  isVerifying,
  loadingText,
  verifyError = '',
  isVerified = false,
  successMessage,
  isSending = false,
  resendText = '인증번호 다시 받기',
  resendingText = '재발송 중...',
  onResend,
  onPressNumber,
  onPressDelete,
  bottomAction,
}: VerificationCodeStepProps) {
  const dots = Array.from({ length: codeLength }).map((_, index) => (
    <View
      key={`verification-dot-${index}`}
      style={[dotStyle, index < code.length && dotFilledStyle]}
    />
  ));

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>
        {onBack ? (
          <TouchableOpacity style={backButtonStyle} onPress={onBack}>
            <Ionicons
              name="chevron-back"
              size={backIconSize}
              color={backIconColor}
            />
          </TouchableOpacity>
        ) : null}

        {stepIndicator}

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={titleStyle}>{title}</Text>
          <Text style={subtitleStyle}>{subtitle}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(400)}
          style={dotsContainerStyle}
        >
          {dots}
        </Animated.View>

        {isVerifying ? (
          <View style={feedbackRowStyle}>
            <ActivityIndicator color={loadingIndicatorColor} size="small" />
            <Text style={loadingTextStyle}>{loadingText}</Text>
          </View>
        ) : null}

        {isVerified && successMessage ? (
          <View style={feedbackRowStyle}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={successIconColor}
            />
            <Text style={successTextStyle}>{successMessage}</Text>
          </View>
        ) : null}

        {verifyError.length > 0 && !isVerified ? (
          <Text style={errorTextStyle}>{verifyError}</Text>
        ) : null}

        {!isVerified && onResend ? (
          <View style={resendRowStyle}>
            <TouchableOpacity onPress={onResend} disabled={isSending}>
              <Text style={resendTextStyle}>
                {isSending ? resendingText : resendText}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {!isVerified ? (
        <View style={keypadWrapperStyle}>
          <SecureKeypad
            onPressNumber={onPressNumber}
            onPressDelete={onPressDelete}
          />
        </View>
      ) : (
        bottomAction
      )}
    </View>
  );
}
