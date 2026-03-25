import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import SecureKeypad from '../../components/common/SecureKeypad';
import StepIndicator from '../../components/common/StepIndicator';
import { styles } from './VerifyCodeScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import { verifySmsCode, findUserId } from '../../services/auth';
import {
  buildBirthDateFromIdentity,
  buildGenderFromIdentity,
} from '../../utils/authIdentity';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';

const MAX_CODE_LENGTH = 6;

export default function VerifyCodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const shakeTranslateX = useSharedValue(0);
  const signupMode = route.params?.signupMode === 'ssafy' ? 'ssafy' : 'normal';

  const handlePressNumber = (num: string) => {
    if (isVerifying || code.length >= MAX_CODE_LENGTH) {
      return;
    }

    const newCode = code + num;
    setCode(newCode);

    if (newCode.length === MAX_CODE_LENGTH) {
      void verifyCodeSubmit(newCode);
    }
  };

  const handlePressDelete = () => {
    if (isVerifying || code.length === 0) {
      return;
    }

    setCode(code.slice(0, -1));
  };

  const handleFindIdFlow = async () => {
    const birthDate = buildBirthDateFromIdentity(route.params?.ssnFront, route.params?.ssnBack);
    const gender = buildGenderFromIdentity(route.params?.ssnBack);

    if (!birthDate || !gender) {
      throw new Error('생년월일 정보를 다시 확인해 주세요.');
    }

    try {
      const result = await findUserId({
        name: route.params.name,
        birthDate,
        gender,
        phoneNumber: route.params.phone,
      });

      navigation.navigate('AccountRecoveryResult', {
        name: route.params.name,
        userId: result.userId,
        userType: 'local',
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        '입력한 정보와 일치하는 계정을 찾지 못했어요.',
      );

      if (error?.response?.status === 401) {
        navigation.navigate('AccountRecoveryResult', {
          name: route.params.name,
          userType: 'none',
        });
        return;
      }

      if (/SSAFY/i.test(message)) {
        navigation.navigate('AccountRecoveryResult', {
          name: route.params.name,
          userType: 'ssafy',
        });
        return;
      }

      throw error;
    }
  };

  const handleFindPasswordFlow = () => {
    navigation.navigate('ResetPassword', {
      userId: route.params.userId,
      name: route.params.name,
      ssnFront: route.params.ssnFront,
      ssnBack: route.params.ssnBack,
      phoneNumber: route.params.phone,
    });
  };

  const verifyCodeSubmit = async (finalCode: string) => {
    setIsVerifying(true);
    setVerifyError('');

    try {
      await verifySmsCode({
        phoneNumber: route.params.phone,
        code: finalCode,
      });

      if (route.params.flow === 'FindId') {
        await handleFindIdFlow();
        return;
      }

      if (route.params.flow === 'FindPw') {
        handleFindPasswordFlow();
        return;
      }

      if (signupMode === 'ssafy') {
        navigation.replace('Welcome', {
          signupMode: 'ssafy',
          pendingToken: route.params.pendingToken,
          name: route.params.name,
          birthDate:
            buildBirthDateFromIdentity(route.params?.ssnFront, route.params?.ssnBack) ?? undefined,
          gender: buildGenderFromIdentity(route.params?.ssnBack) ?? undefined,
          phoneNumber: route.params.phone,
          termsAgreed: route.params.termsAgreed,
          alarmEnabled: true,
        });
        return;
      }

      navigation.replace('CreateAccount', route.params);
    } catch (error: any) {
      let message = extractApiErrorMessage(
        error,
        '인증번호 확인에 실패했어요. 다시 시도해 주세요.',
      );
      let alertTitle = '인증 오류';
      let alertMessage = message;

      if (
        (route.params.flow === 'FindId' || route.params.flow === 'FindPw') &&
        error?.response?.status === 401
      ) {
        message = '입력한 정보와 일치하는 계정을 찾지 못했어요.';
      } else {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'sms-verify',
          fallbackMessage: '인증번호 확인에 실패했어요. 다시 시도해 주세요.',
        });
        message = presentation.inlineMessage;
        alertTitle = presentation.title;
        alertMessage = presentation.alertMessage;
      }

      setVerifyError(message);
      setCode('');
      Alert.alert(alertTitle, alertMessage);
    } finally {
      setIsVerifying(false);
    }
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
        {route.params.flow !== 'FindId' && route.params.flow !== 'FindPw' && (
          <StepIndicator currentStep={2} totalSteps={5} />
        )}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>인증번호 6자리를 입력해 주세요.</Text>
          <Text style={styles.subtitle}>문자로 받은 인증번호를 입력하면 다음 단계로 이동해요.</Text>
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
            <Text style={styles.loadingText}>인증번호를 확인하고 있어요.</Text>
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
