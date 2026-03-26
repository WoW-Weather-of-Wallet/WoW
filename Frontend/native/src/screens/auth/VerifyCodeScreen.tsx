import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import StepIndicator from '../../components/common/StepIndicator';
import { VERIFICATION_CODE_LENGTH } from '../../constants/auth/identityVerification';
import { COLORS, hp } from '../../constants/theme';
import { useVerificationCodeInput, useVerifyCodeFlow } from '../../hooks';
import { styles } from './VerifyCodeScreen.styles';
import type { RootScreenProps } from '../../types';
import type { VerifyCodeRouteParams } from '../../types/auth';

export default function VerifyCodeScreen({
  route,
}: RootScreenProps<'VerifyCode'>) {
  const insets = useSafeAreaInsets();
  const routeParams = (route?.params ?? {}) as VerifyCodeRouteParams;
  const {
    isRecoveryFlow,
    isVerifying,
    verifyError,
    submitVerifyCode,
  } = useVerifyCodeFlow(routeParams);
  const {
    code,
    handlePressNumber,
    handlePressDelete,
  } = useVerificationCodeInput({
    codeLength: VERIFICATION_CODE_LENGTH,
    disabled: isVerifying,
    onComplete: submitVerifyCode,
    clearAfterComplete: true,
  });

  return (
    <VerificationCodeStep
      containerStyle={styles.container}
      contentStyle={[styles.content, { paddingTop: insets.top + hp(60) }]}
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
      dotsContainerStyle={styles.dotsContainer}
      dotStyle={styles.dot}
      dotFilledStyle={styles.dotFilled}
      feedbackRowStyle={styles.loadingRow}
      loadingTextStyle={styles.loadingText}
      errorTextStyle={styles.errorText}
      keypadWrapperStyle={[
        styles.keypadWrapper,
        { paddingBottom: Math.max(insets.bottom, hp(24)) },
      ]}
      stepIndicator={
        !isRecoveryFlow ? (
          <StepIndicator currentStep={2} totalSteps={5} />
        ) : undefined
      }
      title="인증번호 6자리를 입력해주세요."
      subtitle="문자로 전송된 인증번호를 순서대로 입력해주세요."
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      loadingIndicatorColor={COLORS.primary}
    />
  );
}
