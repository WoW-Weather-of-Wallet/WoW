import React from 'react';
import IdentityVerificationCodeStage from '../../components/common/IdentityVerificationCodeStage';
import StepIndicator from '../../components/common/StepIndicator';
import { VERIFICATION_CODE_LENGTH } from '../../constants/auth/identityVerification';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useVerificationCodeInput, useVerifyCodeFlow } from '../../hooks';
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
      containerStyle={{ flex: 1, backgroundColor: COLORS.background }}
      contentBaseStyle={{ flex: 1, paddingHorizontal: wp(28) }}
      titleStyle={{
        fontSize: fp(28),
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        lineHeight: fp(40),
        letterSpacing: -0.5,
        marginBottom: hp(12),
      }}
      subtitleStyle={{
        fontSize: fp(16),
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        marginBottom: hp(32),
      }}
      dotsContainerStyle={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: wp(16),
        marginTop: hp(48),
      }}
      dotStyle={{
        width: wp(16),
        height: wp(16),
        borderRadius: wp(8),
        backgroundColor: COLORS.gray200,
      }}
      dotFilledStyle={{ backgroundColor: COLORS.primary }}
      feedbackRowStyle={{
        marginTop: hp(28),
        alignItems: 'center',
        gap: hp(10),
      }}
      loadingTextStyle={{
        fontSize: fp(14),
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
      }}
      errorTextStyle={{
        marginTop: hp(24),
        textAlign: 'center',
        fontSize: fp(14),
        fontFamily: FONTS.medium,
        color: COLORS.error,
      }}
      keypadWrapperBaseStyle={{ backgroundColor: COLORS.background }}
      topPadding={hp(60)}
      bottomMinPadding={hp(24)}
      stepIndicator={
        !isRecoveryFlow ? (
          <StepIndicator currentStep={2} totalSteps={5} />
        ) : undefined
      }
      hideDefaultStepIndicator
      title="문자로 받은 인증번호 6자리를 입력해 주세요"
      subtitle="휴대폰으로 전송된 인증번호를 입력하면 다음 단계로 이동할 수 있어요."
      code={code}
      codeLength={VERIFICATION_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요."
      verifyError={verifyError}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
    />
  );
}
