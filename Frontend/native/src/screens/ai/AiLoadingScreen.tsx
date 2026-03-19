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
  }, []);

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
    setTimeout(() => {
      pulseScale.value = withTiming(2.5, { duration: 1000 });
      pulseOpacity.value = withSequence(
        withTiming(0.4, { duration: 200 }),
        withTiming(0, { duration: 800 })
      );
    }, 200);
  }, []);

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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const runStep = (stepIndex: number) => {
      if (stepIndex >= LOADING_STEPS.length) {
        navigation.replace('AiResult');
        return;
      }
      setCurrentStep(stepIndex);
      const nextProgress = (stepIndex + 1) / LOADING_STEPS.length;
      progress.value = withTiming(nextProgress, { duration: LOADING_STEPS[stepIndex].duration });
      timeout = setTimeout(() => {
        runStep(stepIndex + 1);
      }, LOADING_STEPS[stepIndex].duration);
    };
    runStep(0);
    return () => clearTimeout(timeout);
  }, []);

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

      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
      </View>
    </View>
  );
}
