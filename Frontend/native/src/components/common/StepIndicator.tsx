import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, wp } from '../../constants/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  compact?: boolean;
}

const BEAD_SIZE = wp(12);
const SMALL_BEAD_SIZE = wp(4);
const RIPPLE_COUNT = 3;

const MultiPulseRipple = ({ active }: { active: boolean }) => {
  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: RIPPLE_COUNT }).map((_, index) => (
        <RippleCircle key={index} index={index} active={active} />
      ))}
    </View>
  );
};

const RippleCircle = ({ index, active }: { index: number; active: boolean }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      const delay = index * 600;

      scale.value = withDelay(
        delay,
        withRepeat(withTiming(3, { duration: 2000 }), -1, false)
      );
      opacity.value = withDelay(
        delay,
        withRepeat(withTiming(0, { duration: 2000 }), -1, false)
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0);
    }
  }, [active, index, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: BEAD_SIZE,
          height: BEAD_SIZE,
          borderRadius: BEAD_SIZE / 2,
          backgroundColor: COLORS.primary,
        },
        animatedStyle,
      ]}
    />
  );
};

const BreathingBead = ({ active, isCompleted }: { active: boolean; isCompleted: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: BEAD_SIZE,
          height: BEAD_SIZE,
          borderRadius: BEAD_SIZE / 2,
          backgroundColor: active || isCompleted ? COLORS.primary : COLORS.border,
          zIndex: 10,
        },
        active && {
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 5,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function StepIndicator({
  currentStep,
  totalSteps = 4,
  compact = false,
}: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <View
      className="flex-row items-center justify-center"
      style={{
        height: compact ? wp(28) : wp(40),
        marginVertical: compact ? 0 : wp(24),
      }}
    >
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <View
              className="relative items-center justify-center"
              style={{
                width: BEAD_SIZE * 2,
                height: BEAD_SIZE * 2,
              }}
            >
              <MultiPulseRipple active={isActive} />
              <BreathingBead active={isActive} isCompleted={isCompleted} />
            </View>

            {index < steps.length - 1 && (
              <View
                className="flex-row items-center"
                style={{ gap: wp(6), marginHorizontal: wp(4) }}
              >
                {[1, 2, 3].map((dot) => (
                  <View
                    key={dot}
                    style={{
                      width: SMALL_BEAD_SIZE,
                      height: SMALL_BEAD_SIZE,
                      borderRadius: SMALL_BEAD_SIZE / 2,
                      backgroundColor: isCompleted ? COLORS.primary : COLORS.border,
                      opacity: isCompleted ? 0.6 : 1,
                    }}
                  />
                ))}
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
