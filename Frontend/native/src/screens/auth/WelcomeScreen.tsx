import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import KeyValueInfoCard from '../../components/common/KeyValueInfoCard';
import AuthActionButton from '../../components/common/AuthActionButton';
import { styles } from './WelcomeScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import { useWelcomeFlow, useWelcomeSummary } from '../../hooks';
import type { RootScreenProps } from '../../types';
import type { WelcomeRouteParams } from '../../types/auth';

export default function WelcomeScreen({
  route,
}: RootScreenProps<'Welcome'>) {
  const routeParams: WelcomeRouteParams = route.params ?? {};
  const { isConfirming, isSsafySignup, handleConfirm } =
    useWelcomeFlow(routeParams);
  const { title, subtitle, summaryItems } = useWelcomeSummary({
    routeParams,
    isSsafySignup,
  });

  return (
    <AuthStepLayout
      currentStep={5}
      totalSteps={5}
      title={title}
      description={subtitle}
      headerContent={
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.iconContainer}
        >
          <Ionicons
            name="checkmark-circle"
            size={wp(84)}
            color={COLORS.primary}
          />
        </Animated.View>
      }
      scrollContentPaddingTop={hp(44)}
      scrollContentPaddingBottom={hp(24)}
      bottomMinPadding={hp(24)}
      stepIndicatorContainerStyle={{ marginBottom: hp(16) }}
      titleSectionStyle={[styles.titleBlock, { marginBottom: 0 }]}
      titleStyle={styles.title}
      descriptionStyle={styles.subtitle}
      bottomContainerStyle={styles.bottomSection}
      bottomContent={
        <Animated.View entering={FadeInDown.delay(380).duration(500)}>
          <AuthActionButton
            label="시작하기"
            loading={isConfirming}
            disabled={isConfirming}
            onPress={() => void handleConfirm()}
            containerStyle={styles.confirmButton}
            disabledContainerStyle={styles.confirmButtonDisabled}
            textStyle={styles.confirmButtonText}
            loadingColor={COLORS.textInverse}
          />
        </Animated.View>
      }
    >
      <Animated.View
        entering={FadeInDown.delay(280).duration(500)}
        style={styles.infoSection}
      >
        <KeyValueInfoCard
          items={summaryItems}
          containerStyle={styles.infoCard}
          rowStyle={styles.infoRow}
          labelStyle={styles.infoLabel}
          valueStyle={styles.infoValue}
        />
      </Animated.View>
    </AuthStepLayout>
  );
}
