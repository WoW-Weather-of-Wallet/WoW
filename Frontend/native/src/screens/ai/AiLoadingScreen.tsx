import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, hp, wp } from '../../constants/theme';
import BottomTabOverlayLayout from '../../components/common/BottomTabOverlayLayout';
import { AiLoadingStage, AiStackHeader, buildAiStackHeaderTitle } from '../../components/ai';
import { useAiLoadingFlow, useResponsiveLayoutMode } from '../../hooks';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiLoadingScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiLoading'>) {
  const insets = useSafeAreaInsets();
  const {
    isCompact,
    pageHorizontal,
    topDockTopPadding,
    scrollBottomPadding,
  } = useResponsiveLayoutMode();
  const sessionUserName = useAuthStore((state) => state.user?.name ?? null);
  const reportPeriod = resolveAiReportPeriod();
  const { currentStep, step, isLastStep, animatedProgressStyle } = useAiLoadingFlow({
    navigation,
  });
  const headerTitle = buildAiStackHeaderTitle(sessionUserName, reportPeriod.month);

  return (
    <BottomTabOverlayLayout
      containerStyle={{
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
      }}
      contentContainerStyle={{
        flex: 1,
      }}
      backgroundColor={COLORS.backgroundSecondary}
      bottomOverlayBottomPadding={scrollBottomPadding}
      bottomOverlayStyle={{ alignItems: 'center' }}
      bottomOverlayContent={
        <View
          className="overflow-hidden"
          style={{
            width: isCompact ? wp(180) : wp(200),
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
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: insets.top + topDockTopPadding,
            paddingHorizontal: pageHorizontal,
          }}
        >
          <AiStackHeader
            title={headerTitle}
            showBackButton
            onPressBack={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }

              navigation.navigate('AiFeedbackHome');
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: pageHorizontal,
          }}
        >
          <AiLoadingStage currentStep={currentStep} step={step} isLastStep={isLastStep} />
        </View>
      </View>
    </BottomTabOverlayLayout>
  );
}
