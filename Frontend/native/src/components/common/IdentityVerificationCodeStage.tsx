import React from 'react';
import {
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepIndicator from './StepIndicator';
import VerificationCodeStep from './VerificationCodeStep';
import AuthActionButton from './AuthActionButton';
import { COLORS } from '../../constants/theme';

interface IdentityVerificationCodeStageProps {
  containerStyle?: StyleProp<ViewStyle>;
  contentBaseStyle: StyleProp<ViewStyle>;
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
  keypadWrapperBaseStyle: StyleProp<ViewStyle>;
  bottomContainerStyle: StyleProp<ViewStyle>;
  stepIndicatorContainerStyle?: StyleProp<ViewStyle>;
  topPadding: number;
  bottomMinPadding: number;
  onBack: () => void;
  backIconSize?: number;
  backIconColor?: string;
  loadingIndicatorColor?: string;
  successIconColor?: string;
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
  onResend?: () => void;
  onPressNumber: (value: string) => void;
  onPressDelete: () => void;
  actionLabel: string;
  actionLoading?: boolean;
  actionDisabled?: boolean;
  onActionPress?: () => void;
  actionContainerStyle?: StyleProp<ViewStyle>;
  actionDisabledContainerStyle?: StyleProp<ViewStyle>;
  actionTextStyle?: StyleProp<TextStyle>;
  actionDisabledTextStyle?: StyleProp<TextStyle>;
  actionLoadingColor?: string;
}

export default function IdentityVerificationCodeStage({
  containerStyle,
  contentBaseStyle,
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
  keypadWrapperBaseStyle,
  bottomContainerStyle,
  stepIndicatorContainerStyle,
  topPadding,
  bottomMinPadding,
  onBack,
  backIconSize = 24,
  backIconColor = COLORS.textPrimary,
  loadingIndicatorColor = COLORS.primary,
  successIconColor = COLORS.success,
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
  onResend,
  onPressNumber,
  onPressDelete,
  actionLabel,
  actionLoading = false,
  actionDisabled = false,
  onActionPress,
  actionContainerStyle,
  actionDisabledContainerStyle,
  actionTextStyle,
  actionDisabledTextStyle,
  actionLoadingColor = COLORS.white,
}: IdentityVerificationCodeStageProps) {
  const insets = useSafeAreaInsets();

  return (
    <VerificationCodeStep
      containerStyle={containerStyle}
      contentStyle={[contentBaseStyle, { paddingTop: insets.top + topPadding }]}
      backButtonStyle={backButtonStyle}
      titleStyle={titleStyle}
      subtitleStyle={subtitleStyle}
      dotsContainerStyle={dotsContainerStyle}
      dotStyle={dotStyle}
      dotFilledStyle={dotFilledStyle}
      feedbackRowStyle={feedbackRowStyle}
      loadingTextStyle={loadingTextStyle}
      errorTextStyle={errorTextStyle}
      successTextStyle={successTextStyle}
      resendRowStyle={resendRowStyle}
      resendTextStyle={resendTextStyle}
      keypadWrapperStyle={[
        keypadWrapperBaseStyle,
        { paddingBottom: Math.max(insets.bottom, bottomMinPadding) },
      ]}
      onBack={onBack}
      backIconSize={backIconSize}
      backIconColor={backIconColor}
      loadingIndicatorColor={loadingIndicatorColor}
      successIconColor={successIconColor}
      stepIndicator={
        <View style={stepIndicatorContainerStyle}>
          <StepIndicator currentStep={2} totalSteps={2} compact />
        </View>
      }
      title={title}
      subtitle={subtitle}
      code={code}
      codeLength={codeLength}
      isVerifying={isVerifying}
      loadingText={loadingText}
      verifyError={verifyError}
      isVerified={isVerified}
      successMessage={successMessage}
      isSending={isSending}
      onResend={onResend}
      onPressNumber={onPressNumber}
      onPressDelete={onPressDelete}
      bottomAction={
        <View
          style={[
            bottomContainerStyle,
            { paddingBottom: Math.max(insets.bottom, bottomMinPadding) },
          ]}
        >
          <AuthActionButton
            label={actionLabel}
            loading={actionLoading}
            disabled={actionDisabled}
            onPress={onActionPress}
            containerStyle={actionContainerStyle}
            disabledContainerStyle={actionDisabledContainerStyle}
            textStyle={actionTextStyle}
            disabledTextStyle={actionDisabledTextStyle}
            loadingColor={actionLoadingColor}
          />
        </View>
      }
    />
  );
}
