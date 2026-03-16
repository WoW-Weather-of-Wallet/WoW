import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, wp } from '../../constants/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number; // 기본값 4
}

const BEAD_SIZE = wp(12);
const SMALL_BEAD_SIZE = wp(4);
const RIPPLE_COUNT = 3;

/**
 * 활성화된 단계의 구슬 뒤에서 퍼지는 프리미엄 트리플 파동 효과
 */
const MultiPulseRipple = ({ active }: { active: boolean }) => {
  return (
    <View style={styles.rippleContainer}>
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <RippleCircle key={i} index={i} active={active} />
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
      opacity.value = 0.5;
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
  }, [active, index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.rippleCircle, animatedStyle]} />;
};

/**
 * 활성화된 구슬의 숨쉬는 듯한 스케일 애니메이션
 */
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
        styles.bead,
        active && styles.activeBead,
        isCompleted && styles.completedBead,
        active && styles.activeGlow,
        animatedStyle,
      ]}
    />
  );
};

export default function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <React.Fragment key={step}>
            <View style={styles.beadWrapper}>
              <MultiPulseRipple active={isActive} />
              <BreathingBead active={isActive} isCompleted={isCompleted} />
            </View>
            
            {index < steps.length - 1 && (
              <View style={styles.connectorWrapper}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.smallBead,
                      isCompleted && styles.completedSmallBead,
                    ]}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: wp(40),
    marginVertical: wp(24),
  },
  beadWrapper: {
    width: BEAD_SIZE * 2,
    height: BEAD_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bead: {
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    backgroundColor: '#E5E7EB',
    zIndex: 10,
  },
  activeBead: {
    backgroundColor: COLORS.primary,
  },
  completedBead: {
    backgroundColor: COLORS.primary,
  },
  activeGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rippleCircle: {
    position: 'absolute',
    width: BEAD_SIZE,
    height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2,
    backgroundColor: COLORS.primary,
  },
  connectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginHorizontal: wp(4),
  },
  smallBead: {
    width: SMALL_BEAD_SIZE,
    height: SMALL_BEAD_SIZE,
    borderRadius: SMALL_BEAD_SIZE / 2,
    backgroundColor: '#E5E7EB',
  },
  completedSmallBead: {
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
});
