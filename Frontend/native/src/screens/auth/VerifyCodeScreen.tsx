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
import { COLORS, wp, hp } from '../../constants/theme';
import { verifySmsCode, findUserId } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

const MAX_CODE_LENGTH = 6;

export default function VerifyCodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const shakeTranslateX = useSharedValue(0);

  // Build the backend birthDate field from the verified identity payload.
  const getBirthDateFromIdentity = () => {
    const ssnFront = route.params?.ssnFront ?? '';
    const ssnBack = route.params?.ssnBack ?? '';

    if (ssnFront.length !== 6 || ssnBack.length === 0) {
      return null;
    }

    const centuryCode = ssnBack[0];
    const century =
      centuryCode === '1' || centuryCode === '2' || centuryCode === '5' || centuryCode === '6'
        ? '19'
        : '20';

    return `${century}${ssnFront.slice(0, 2)}-${ssnFront.slice(2, 4)}-${ssnFront.slice(4, 6)}`;
  };

  const getGenderFromIdentity = () => {
    const ssnBack = route.params?.ssnBack ?? '';

    if (ssnBack.length === 0) {
      return null;
    }

    return parseInt(ssnBack[0], 10) % 2 !== 0 ? 'M' : 'F';
  };

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
    const birthDate = getBirthDateFromIdentity();
    const gender = getGenderFromIdentity();

    if (!birthDate || !gender) {
      throw new Error('생년월일 정보가 누락되었어요.');
    }

    try {
      // Only call the recovery API after SMS verification succeeds.
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

      // Recovery result screens stay split between missing accounts and SSAFY accounts.
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
    // After SMS verification, move to the screen that submits the new password.
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

      // Signup flow returns to the account creation screen with verified identity data.
      navigation.replace('CreateAccount', route.params);
    } catch (error: any) {
      let message = extractApiErrorMessage(
        error,
        'Failed to verify the code. Please try again.',
      );

      if (
        (route.params.flow === 'FindId' || route.params.flow === 'FindPw') &&
        error?.response?.status === 401
      ) {
        message = '입력한 정보와 일치하는 계정을 찾지 못했어요.';
      }

      setVerifyError(message);
      setCode('');
      Alert.alert('인증 오류', message);
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
          <Text style={styles.title}>인증번호 6자리를 입력해주세요.</Text>
          <Text style={styles.subtitle}>휴대폰으로 받은 인증번호를 입력하면 다음 단계로 이동해요.</Text>
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


