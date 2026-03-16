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
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { verifySmsCode } from '../../services/auth';
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
        // 아이디 찾기 성공: 아이디 안내 (현재는 더미 알럿, 추후 결과 화면으로 이동 가능)
        Alert.alert(
          '아이디 확인',
          `${route.params.name}님의 아이디는 [ssafy***] 입니다.`,
          [{ text: '로그인하러 가기', onPress: () => navigation.navigate('Login') }]
        );
      } else if (route.params.flow === 'FindPw') {
        // 비밀번호 찾기 성공: 비밀번호 재설정 화면으로 이동
        Alert.alert(
          '인증 성공',
          '본인 확인이 완료되었습니다. 비밀번호 재설정 페이지로 이동합니다.',
          [{ text: '확인', onPress: () => console.log('비밀번호 재설정 화면 이동 개발 예정') }]
        );
      } else {
        // 기본 플로우 (회원가입)
        navigation.replace('CreateAccount', route.params);
      }
    } catch (error: any) {
      // 인증번호 검증도 공통 파서를 사용해 message 필드 차이를 화면에서 숨깁니다.
      const message = extractApiErrorMessage(
        error,
        '인증번호 확인에 실패했어요. 다시 입력해주세요.',
      );

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
        <Animated.View entering={FadeInDown.duration(500)}>
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

        {/* 인증 서버 상태와 무관하게 계정 생성 화면 개발을 이어갈 수 있도록 우회 버튼을 둡니다. */}
        <DevShortcutButton
          label="TEST: 인증 성공 처리"
          description="인증 절차를 건너뛰고 다음 화면으로 이동합니다."
          onPress={() => {
             if (route.params.flow === 'FindId') {
               Alert.alert('아이디 확인', `${route.params.name}님의 아이디는 [test_user] 입니다.`);
             } else if (route.params.flow === 'FindPw') {
               Alert.alert('비밀번호 재설정', '비밀번호 재설정 단계로 이동합니다.');
             } else {
               navigation.replace('CreateAccount', route.params);
             }
          }}
        />
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
