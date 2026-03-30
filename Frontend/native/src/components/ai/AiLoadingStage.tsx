import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { AiLoadingStep } from '../../hooks';

interface AiLoadingStageProps {
  currentStep: number;
  step: AiLoadingStep;
  isLastStep: boolean;
}

function PulseRing({ delayTime = 0 }: { delayTime?: number }) {
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

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: wp(100),
          height: wp(100),
          borderRadius: wp(50),
          borderWidth: 2,
          borderColor: COLORS.primary,
          backgroundColor: 'transparent',
        },
        animatedStyle,
      ]}
    />
  );
}

function CompletionCheck() {
  const scale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });

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
    <View
      className="items-center justify-center"
      style={{ marginBottom: 0, height: hp(212) }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: wp(100),
            height: wp(100),
            borderRadius: wp(50),
            borderWidth: 2,
            borderColor: COLORS.primary,
            backgroundColor: 'transparent',
          },
          animatedPulseStyle,
        ]}
      />
      <Animated.View style={animatedIconStyle}>
        <Ionicons name="checkmark-circle" size={wp(160)} color={COLORS.primary} />
      </Animated.View>
    </View>
  );
}

export default function AiLoadingStage({
  currentStep,
  step,
  isLastStep,
}: AiLoadingStageProps) {
  return (
    <Animated.View
      key={currentStep}
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(800)}
    >
      {isLastStep ? (
        <CompletionCheck />
      ) : (
        <View
          className="items-center justify-center"
          style={{ marginBottom: hp(28), height: hp(92) }}
        >
          <PulseRing delayTime={0} />
          <PulseRing delayTime={1000} />
          <Ionicons
            name={step.icon}
            size={wp(80)}
            color={COLORS.primary}
            style={
              step.icon === 'sparkles-outline'
                ? { marginLeft: wp(6), marginTop: hp(6) }
                : undefined
            }
          />
        </View>
      )}

      {!isLastStep ? (
        <View className="items-center">
          <Text
            className="text-center"
            style={{
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              lineHeight: fp(28),
            }}
          >
            {step.text}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}
