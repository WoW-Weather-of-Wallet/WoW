import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import SecureKeypad from '../../components/common/SecureKeypad';
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
  const shakeTranslateX = useSharedValue(0);
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

  const renderDots = () => {
    const dots = [];

    for (let i = 0; i < MAX_CODE_LENGTH; i += 1) {
      const isFilled = i < code.length;
      dots.push(<View key={i} style={[styles.dot, isFilled && styles.dotFilled]} />);
    }

    return dots;
  };

  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + hp(60) }]}>
        {!isRecoveryFlow && <StepIndicator currentStep={2} totalSteps={5} />}

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>인증번호 6자리를 입력해 주세요</Text>
          <Text style={styles.subtitle}>
            문자로 받은 인증번호를 입력하면 다음 단계로 이동해요.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.dotsContainer, shakeAnimatedStyle]}
        >
          {renderDots()}
        </Animated.View>

        {isVerifying && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>인증번호를 확인하고 있어요</Text>
          </View>
        )}

        {verifyError.length > 0 && <Text style={styles.errorText}>{verifyError}</Text>}
      </View>

      <View style={[styles.keypadWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
        <SecureKeypad onPressNumber={handlePressNumber} onPressDelete={handlePressDelete} />
      </View>
    </View>
  );
}
