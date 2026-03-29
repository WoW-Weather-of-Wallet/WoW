import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, hp, wp } from '../../constants/theme';
import BottomTabOverlayLayout from '../../components/common/BottomTabOverlayLayout';
import { AiLoadingStage } from '../../components/ai';
import { useAiLoadingFlow } from '../../hooks';
import type { AiFeedbackStackScreenProps } from '../../types';

export default function AiLoadingScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiLoading'>) {
  const { currentStep, step, isLastStep, animatedProgressStyle } = useAiLoadingFlow({
    navigation,
  });

  return (
    <BottomTabOverlayLayout
      containerStyle={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(24),
      }}
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
      backgroundColor={COLORS.background}
      topOverlayTopPadding={hp(16)}
      topOverlayStyle={{
        paddingHorizontal: wp(24),
        zIndex: 2,
      }}
      bottomOverlayBottomPadding={hp(30)}
      bottomOverlayStyle={{ alignItems: 'center' }}
      bottomOverlayContent={
        <View
          className="overflow-hidden"
          style={{
            width: wp(200),
            height: 4,
            borderRadius: 999,
            backgroundColor: COLORS.progressTrackBackground,
          }}
        >
          <Animated.View
            style={[{ height: '100%', backgroundColor: COLORS.primary }, animatedProgressStyle]}
          />
        </View>
      }
    >
      <AiLoadingStage currentStep={currentStep} step={step} isLastStep={isLastStep} />
    </BottomTabOverlayLayout>
  );
}
