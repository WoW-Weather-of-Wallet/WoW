import React from 'react';
import IdentityVerificationCodeStage from '../../components/common/IdentityVerificationCodeStage';
import StepIndicator from '../../components/common/StepIndicator';
import { VERIFICATION_CODE_LENGTH } from '../../constants/auth/identityVerification';
import { hp } from '../../constants/theme';
import { useVerificationCodeInput, useVerifyCodeFlow } from '../../hooks';
import { styles } from './VerifyCodeScreen.styles';
import type { RootScreenProps } from '../../types';
import type { VerifyCodeRouteParams } from '../../types/auth';

export default function VerifyCodeScreen({
  route,
}: RootScreenProps<'VerifyCode'>) {
  const routeParams = (route?.params ?? {}) as VerifyCodeRouteParams;
  const {
    isRecoveryFlow,
    isVerifying,
    verifyError,
    submitVerifyCode,
  } = useVerifyCodeFlow(routeParams);
  const { code, handlePressNumber, handlePressDelete } =
    useVerificationCodeInput({
      codeLength: VERIFICATION_CODE_LENGTH,
      disabled: isVerifying,
      onComplete: submitVerifyCode,
      clearAfterComplete: true,
    });

  return (
    <IdentityVerificationCodeStage
      containerStyle={styles.container}
      contentBaseStyle={styles.content}
      titleStyle={styles.title}
      subtitleStyle={styles.subtitle}
      dotsContainerStyle={styles.dotsContainer}
      dotStyle={styles.dot}
      dotFilledStyle={styles.dotFilled}
      feedbackRowStyle={styles.loadingRow}
      loadingTextStyle={styles.loadingText}
      errorTextStyle={styles.errorText}
      keypadWrapperBaseStyle={styles.keypadWrapper}
      topPadding={hp(60)}
      bottomMinPadding={hp(24)}
      stepIndicator={
        !isRecoveryFlow ? (
          <StepIndicator currentStep={2} totalSteps={5} />
        ) : undefined
      }
      hideDefaultStepIndicator
      title="?ëª„ì¬†è¸°ëŠìƒ‡ 6?ë¨®â”ç‘œ??ë‚…ì °?ëŒï¼œ?ëª„ìŠ‚."
      subtitle="è‡¾ëª„ì˜„æ¿¡??ê¾©ë„š???ëª„ì¬†è¸°ëŠìƒ‡ç‘œ??ì’–ê½Œ?Â€æ¿¡??ë‚…ì °?ëŒï¼œ?ëª„ìŠ‚."
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="?ëª„ì¬†è¸°ëŠìƒ‡ç‘œ??ëº¤ì”¤?ì„í€¬ ?ë‰ë¼±??"
      verifyError={verifyError}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
    />
  );
}
