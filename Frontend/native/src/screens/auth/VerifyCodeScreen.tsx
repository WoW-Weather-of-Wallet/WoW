import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import SecureKeypad from '../../components/common/SecureKeypad';

const MAX_CODE_LENGTH = 6;

export default function VerifyCodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');

  // 에러 또는 성공 시 애니메이션
  const shakeTranslateX = useSharedValue(0);

  const handlePressNumber = (num: string) => {
    if (code.length < MAX_CODE_LENGTH) {
      const newCode = code + num;
      setCode(newCode);

      if (newCode.length === MAX_CODE_LENGTH) {
        verifyCodeSubmit(newCode);
      }
    }
  };

  const handlePressDelete = () => {
    if (code.length > 0) {
      setCode(code.slice(0, -1));
    }
  };

  const verifyCodeSubmit = (finalCode: string) => {
    // 임시 모의 검증 처리
    console.log('인증번호 검증 시도:', finalCode);
    
    setTimeout(() => {
      // 원래는 서버와 통신하지만, 현재는 데모용 넘어가기
      // 성공 애니메이션/로직 처리 후 다음 화면이동
      console.log('인증 완료. 계정 생성(ID/PW) 화면으로 이동.');
      navigation.replace('CreateAccount', route.params);
    }, 500);
  };

  // 6칸의 마스킹 동그라미 렌더링
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < MAX_CODE_LENGTH; i++) {
      const isFilled = i < code.length;
      dots.push(
        <View key={i} style={[styles.dot, isFilled && styles.dotFilled]} />
      );
    }
    return dots;
  };

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 본문 (타이틀 & 인디케이터) */}
      <View style={[styles.content, { paddingTop: insets.top + hp(60) }]}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>인증번호 6자리를{'\n'}입력해주세요.</Text>
          <Text style={styles.subtitle}>문자로 온 6자리 인증번호를 입력합니다.</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)} 
          style={[styles.dotsContainer, shakeAnimatedStyle]}
        >
          {renderDots()}
        </Animated.View>
      </View>

      {/* 커스텀 보안 키패드 */}
      <View style={[styles.keypadWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
        <SecureKeypad 
          onPressNumber={handlePressNumber} 
          onPressDelete={handlePressDelete} 
        />
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
  keypadWrapper: {
    backgroundColor: '#FFFFFF',
  },
});
