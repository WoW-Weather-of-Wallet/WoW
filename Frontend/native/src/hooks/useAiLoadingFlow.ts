import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { Ionicons } from '@expo/vector-icons';
import { useAiStore } from '../store/aiStore';
import type { AiFeedbackStackNavigationProp } from '../types';

type AiLoadingIconName = ComponentProps<typeof Ionicons>['name'];

export interface AiLoadingStep {
  icon: AiLoadingIconName;
  text: string;
  duration: number;
}

const LOADING_STEPS: AiLoadingStep[] = [
  {
    icon: 'document-text-outline',
    text: '최근 소비 흐름을 불러오고 있어요.',
    duration: 2500,
  },
  {
    icon: 'search-outline',
    text: 'AI가 소비 패턴과 절약 포인트를 읽고 있어요.',
    duration: 2500,
  },
  {
    icon: 'sparkles-outline',
    text: '결과를 보기 쉽게 정리하고 있어요.',
    duration: 2500,
  },
  {
    icon: 'checkmark-circle',
    text: '',
    duration: 2000,
  },
];

interface UseAiLoadingFlowOptions {
  navigation: AiFeedbackStackNavigationProp<'AiLoading'>;
}

export function useAiLoadingFlow({ navigation }: UseAiLoadingFlowOptions) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useSharedValue(0);
  const isFocused = useIsFocused();
  const { hideToast, status } = useAiStore();

  useEffect(() => {
    if (isFocused && (status === 'success' || status === 'error')) {
      hideToast();
      navigation.replace('AiResult');
    }
  }, [hideToast, isFocused, navigation, status]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStep = (index: number) => {
      if (index >= LOADING_STEPS.length) {
        return;
      }

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

    return () => clearTimeout(timeout);
  }, [progress]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return {
    currentStep,
    step: LOADING_STEPS[currentStep],
    isLastStep: currentStep === LOADING_STEPS.length - 1,
    animatedProgressStyle,
  };
}
