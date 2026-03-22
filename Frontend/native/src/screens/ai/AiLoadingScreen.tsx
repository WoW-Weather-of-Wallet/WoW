import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp, hp } from '../../constants/theme';
import { styles } from './AiLoadingScreen.styles';
import { useAiStore } from '../../store/aiStore';
import { useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

/**
 * [UX-Plan] 로딩 단계별 구성을 정의합니다.
 */
const LOADING_STEPS = [
  {
    icon: 'document-text-outline',
    text: '필요한 데이터를 불러오는 중..',
    duration: 2500,
  },
  {
    icon: 'search-outline',
    text: 'AI가 소비 패턴을 분석하는 중..',
    duration: 2500,
  },
  {
    icon: 'sparkles-outline',
    text: '맞춤형 분석 결과를 정리 중..',
    duration: 2500,
  },
  {
    icon: 'checkmark-circle',
    text: '', 
    duration: 2000,
  },
];

/**
 * [UI-Component] 파동(Wave) 효과를 내는 컴포넌트입니다.
 */
const PulseRing = ({ delayTime = 0 }: { delayTime?: number }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(withTiming(2.2, { duration: 2000 }), -1, false);
      opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, false);
    }, delayTime);
    return () => clearTimeout(timeout);
  }, [delayTime, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseRing, animatedStyle]} />;
};

/**
 * [UI-Component] 분석 완료를 알리는 프리미엄 체크 애니메이션 컴포넌트입니다.
 * 탄성 있는 바운스(Spring)와 성공을 알리는 파동 효과를 결합합니다.
 */
const CompletionCheck = () => {
  const scale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. 체크 아이콘 등장 애니메이션 (Spring) - 더 빠르고 경쾌하게 조정
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });

    // 2. 등장 직후 성공을 알리는 단발성 파동 효과
    const timeout = setTimeout(() => {
      pulseScale.value = withTiming(2.5, { duration: 1000 });
      pulseOpacity.value = withSequence(
        withTiming(0.4, { duration: 200 }),
        withTiming(0, { duration: 800 })
      );
    }, 200);

    return () => clearTimeout(timeout);
  }, [pulseOpacity, pulseScale, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.lastIconWrapper}>
      <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
      <Animated.View style={animatedIconStyle}>
        <Ionicons name="checkmark-circle" size={wp(160)} color={COLORS.primary} />
      </Animated.View>
    </View>
  );
};

export default function AiLoadingScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useSharedValue(0);
  const isFocused = useIsFocused(); // 현재 화면에 머물고 있는지 확인
  const tabBarHeight = useBottomTabBarHeight();
  const { hideToast, status } = useAiStore();

  // 1. [DELETED] 분석 시작 로직은 이제 AiFeedbackHomeScreen 버튼에서 직접 처리합니다.
  
  // 2. 백그라운드나 다른 탭에 다녀왔을 때, 이미 성공 상태라면 즉시 결과 화면으로 이동
  useEffect(() => {
    if (isFocused && status === 'success') {
      hideToast();
      navigation.replace('AiResult');
    }
  }, [isFocused, status, navigation, hideToast]);

  // 3. 내부 UI 애니메이션 진행 (페이지 진입 시 1회 실행)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStep = (index: number) => {
      if (index >= LOADING_STEPS.length) return;

      setCurrentStep(index);
      const step = LOADING_STEPS[index];
      
      progress.value = withTiming((index + 1) / LOADING_STEPS.length, {
        duration: step.duration,
      });

      if (index < LOADING_STEPS.length - 1) {
        timeout = setTimeout(() => {
          runStep(index + 1);
        }, step.duration);
      }
    };

    runStep(0);

    return () => {
      clearTimeout(timeout);
    };
  }, [progress]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const step = LOADING_STEPS[currentStep];
  const isLastStep = currentStep === LOADING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      <Animated.View 
        key={currentStep} 
        entering={FadeIn.duration(800)}
        exiting={FadeOut.duration(800)}
        style={styles.contentContainer}
      >
        {isLastStep ? (
          <CompletionCheck />
        ) : (
          <View style={styles.iconWrapper}>
            <PulseRing delayTime={0} />
            <PulseRing delayTime={1000} />
            <Ionicons 
              name={step.icon as any} 
              size={wp(80)} 
              color={COLORS.primary} 
              // [UI-Fix] 별빛 아이콘의 시각적 불균형을 해소하기 위한 위치 미세 조정
              style={step.icon === 'sparkles-outline' ? { marginLeft: wp(6), marginTop: hp(6) } : {}}
            />
          </View>
        )}

        {!isLastStep && (
          <View style={styles.textWrapper}>
            <Text style={styles.loadingText}>{step.text}</Text>
          </View>
        )}
      </Animated.View>

      <View style={[styles.progressBarContainer, { bottom: tabBarHeight + hp(30) }]}>
        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
      </View>
    </View>
  );
}
