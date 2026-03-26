import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from './AiLoadingScreen.styles';
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
      containerStyle={styles.container}
      contentContainerStyle={styles.contentContainer}
      backgroundColor={COLORS.background}
      topOverlayTopPadding={hp(16)}
      topOverlayStyle={{
        paddingHorizontal: wp(24),
        zIndex: 2,
      }}
      bottomOverlayBottomPadding={hp(30)}
      bottomOverlayStyle={styles.progressBarOverlay}
      bottomOverlayContent={
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
        </View>
      }
    >
      <AiLoadingStage currentStep={currentStep} step={step} isLastStep={isLastStep} />
    </BottomTabOverlayLayout>
  );
}
