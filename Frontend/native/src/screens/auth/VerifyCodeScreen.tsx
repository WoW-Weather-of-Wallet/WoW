import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import SecureKeypad from '../../components/common/SecureKeypad';
import StepIndicator from '../../components/common/StepIndicator';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
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

    if (!birthDate) {
      throw new Error('Birth date information is missing.');
    }

    try {
      // Only call the recovery API after SMS verification succeeds.
      const result = await findUserId({
        name: route.params.name,
        birthDate,
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
        'Unable to find an account with the provided information.',
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
        message = 'No account matched the provided information.';
      }

      setVerifyError(message);
      setCode('');
      Alert.alert('Verification failed', message);
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
          <Text style={styles.title}>Enter the 6-digit code.</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to your phone. Enter it to continue.
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
            <Text style={styles.loadingText}>Checking the verification code...</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(28),
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(40),
    letterSpacing: -0.5,
    marginBottom: hp(12),
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginBottom: hp(60),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(16),
  },
  dot: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: '#E5E7EB',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  loadingRow: {
    marginTop: hp(28),
    alignItems: 'center',
    gap: hp(10),
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: hp(24),
    textAlign: 'center',
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#EF4444',
  },
  keypadWrapper: {
    backgroundColor: '#FFFFFF',
  },
});
