import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VerificationCodeStep from '../../components/common/VerificationCodeStep';
import StepIndicator from '../../components/common/StepIndicator';
import { COLORS, hp } from '../../constants/theme';
import { useVerifyCodeFlow } from '../../hooks/useVerifyCodeFlow';
import { styles } from './VerifyCodeScreen.styles';
import type { VerifyCodeRouteParams } from '../../types/auth';
import type { RootScreenProps } from '../../types';

const MAX_CODE_LENGTH = 6;

export default function VerifyCodeScreen({ route }: RootScreenProps<'VerifyCode'>) {
  const insets = useSafeAreaInsets();
  const routeParams = (route?.params ?? {}) as VerifyCodeRouteParams;
  const [code, setCode] = useState('');
  const {
    isRecoveryFlow,
    isVerifying,
    verifyError,
    submitVerifyCode,
  } = useVerifyCodeFlow(routeParams);

  const handlePressNumber = (num: string) => {
    if (isVerifying || code.length >= MAX_CODE_LENGTH) {
      return;
    }

    const nextCode = code + num;
    setCode(nextCode);

    if (nextCode.length === MAX_CODE_LENGTH) {
      void submitVerifyCode(nextCode).finally(() => {
        setCode('');
      });
    }
  };

  const handlePressDelete = () => {
    if (isVerifying || code.length === 0) {
      return;
    }

    setCode(code.slice(0, -1));
  };

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
      keypadWrapperStyle={[styles.keypadWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}
      stepIndicator={
        !isRecoveryFlow ? <StepIndicator currentStep={2} totalSteps={5} /> : undefined
      }
      title="인증번호 6자리를 입력해 주세요"
      subtitle="문자로 받은 인증번호를 입력하면 다음 단계로 이동해요."
      code={code}
      codeLength={MAX_CODE_LENGTH}
      isVerifying={isVerifying}
      loadingText="인증번호를 확인하고 있어요"
      verifyError={verifyError}
      onPressNumber={handlePressNumber}
      onPressDelete={handlePressDelete}
      loadingIndicatorColor={COLORS.primary}
    />
  );
}
