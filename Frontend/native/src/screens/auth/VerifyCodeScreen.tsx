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
import DevShortcutButton from '../../components/common/DevShortcutButton';
import StepIndicator from '../../components/common/StepIndicator';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { verifySmsCode, findUserId, findPassword } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

const MAX_CODE_LENGTH = 6;

export default function VerifyCodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const shakeTranslateX = useSharedValue(0);

  const handlePressNumber = (num: string) => {
    if (isVerifying || code.length >= MAX_CODE_LENGTH) {
      return;
    }

    const newCode = code + num;
    setCode(newCode);

    if (newCode.length === MAX_CODE_LENGTH) {
      verifyCodeSubmit(newCode);
    }
  };

  const handlePressDelete = () => {
    if (isVerifying || code.length === 0) {
      return;
    }

    setCode(code.slice(0, -1));
  };

  /**
   * 백엔드가 Redis 에 저장한 인증 상태를 실제로 검증하는 단계입니다.
   * 여기서 성공해야 CreateAccount -> signup 이 휴대폰 인증 완료로 인정됩니다.
   */
  const verifyCodeSubmit = async (finalCode: string) => {
    console.log('인증번호 검증 시도:', finalCode);

    setIsVerifying(true);
    setVerifyError('');

    try {
      await verifySmsCode({
        phoneNumber: route.params.phone,
        code: finalCode,
      });

      console.log('인증 완료. 플로우:', route.params.flow);
      
      if (route.params.flow === 'FindId') {
        /**
         * [Defense-Log] 아이디 찾기 API 연동
         * 하드코딩된 더미 데이터(ssafy_dummy)를 제거하고 실제 백엔드 결과를 조회합니다.
         */
        try {
          const recoveryResult = await findUserId({
            name: route.params.name,
            phoneNumber: route.params.phone,
          });

          navigation.navigate('RecoveryResult', {
            name: route.params.name,
            userId: recoveryResult.userId,
            userType: recoveryResult.userType === 'SSAFY' ? 'ssafy' : 'local'
          });
        } catch (recoveryError: any) {
          /**
           * [Bug-Fix] 아이디 찾기 시 가입 내역이 없는 경우(401)
           * 알림창 대신 '조회 결과 없음(none)' 화면으로 이동하여 가입 유도를 진행합니다.
           */
          if (recoveryError?.response?.status === 401) {
            navigation.navigate('RecoveryResult', {
              name: route.params.name,
              userType: 'none'
            });
            return;
          }

          const recoveryMsg = extractApiErrorMessage(
            recoveryError,
            '아이디 정보를 찾는 중 오류가 발생했습니다.'
          );
          Alert.alert('조회 실패', recoveryMsg);
        }
      } else if (route.params.flow === 'FindPw') {
        /**
         * [Defense-Log] 비밀번호 재설정 권한 확인 API 연동
         * 단순히 인증번호만 맞다고 넘어가는 것이 아니라, 입력한 아이디와 정보가 일치하는지 서버에서 확인합니다.
         */
        try {
          await findPassword({
            userId: route.params.userId,
            name: route.params.name,
            phoneNumber: route.params.phone,
          });

          navigation.navigate('ResetPassword', {
            userId: route.params.userId
          });
        } catch (pwRecoveryError: any) {
          /**
           * [Bug-Fix] 비밀번호 찾기 시 아이디와 이름/번호 정보가 불일치하는 경우(401)
           * 알림창 대신 '정보 불일치(fail)' 화면으로 이동하여 아이디 찾기 제안 등을 수행합니다.
           */
          if (pwRecoveryError?.response?.status === 401) {
            navigation.navigate('RecoveryResult', {
              name: route.params.name,
              userId: route.params.userId,
              userType: 'fail'
            });
            return;
          }

          const pwRecoveryMsg = extractApiErrorMessage(
            pwRecoveryError,
            '계정 정보를 확인할 수 없습니다. 입력하신 정보를 다시 확인해주세요.'
          );
          Alert.alert('확인 실패', pwRecoveryMsg);
        }
      } else {
        // 기본 플로우 (회원가입)
        navigation.replace('CreateAccount', route.params);
      }
    } catch (error: any) {
      // 인증번호 검증도 공통 파서를 사용해 message 필드 차이를 화면에서 숨깁니다.
      let message = extractApiErrorMessage(
        error,
        '인증번호 확인에 실패했어요. 다시 입력해주세요.',
      );

      /**
       * [Bug-Fix] 계정 찾기 플로우에서의 401 에러 대응
       * 전역 에러 핸들러가 401을 "아이디/비번 오류"로만 번역하므로, 
       * 찾기 플로우에서는 "등록된 정보 없음"으로 문구를 재검색하여 보여줍니다.
       */
      const isRecovery = route.params.flow === 'FindId' || route.params.flow === 'FindPw';
      if (isRecovery && (error as any)?.response?.status === 401) {
        message = '일치하는 계정 정보를 찾을 수 없습니다. 정보를 다시 확인해주세요.';
      }

      setVerifyError(message);
      setCode('');
      Alert.alert('인증 실패', message);
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
        {/* [Bug-Fix] 아이디/비밀번호 찾기 시에는 단계 표시기(StepIndicator)를 숨깁니다. */}
        {route.params.flow !== 'FindId' && route.params.flow !== 'FindPw' && (
          <StepIndicator currentStep={2} totalSteps={5} />
        )}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>인증번호 6자리를{`\n`}입력해주세요.</Text>
          <Text style={styles.subtitle}>문자로 전송된 6자리 인증번호를 입력하면 다음 단계로 넘어갑니다.</Text>
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
            <Text style={styles.loadingText}>인증번호를 확인하고 있어요...</Text>
          </View>
        )}

        {verifyError.length > 0 && <Text style={styles.errorText}>{verifyError}</Text>}

        {/* [Defense-Log] 운영 환경 전환을 위해 하드코딩된 인증 우회 버튼(DevShortcutButton)을 제거했습니다. */}
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
