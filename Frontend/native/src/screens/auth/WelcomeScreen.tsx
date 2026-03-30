import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthStepLayout from '../../components/auth/AuthStepLayout';
import AuthActionButton from '../../components/common/AuthActionButton';
import KeyValueInfoCard from '../../components/common/KeyValueInfoCard';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
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
          style={{
            marginTop: hp(10),
            width: '100%',
            alignItems: 'center',
          }}
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
      titleSectionStyle={[
        {
          alignItems: 'center',
          gap: hp(10),
        },
        { marginBottom: 0 },
      ]}
      titleStyle={{
        fontSize: fp(30),
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        textAlign: 'center',
      }}
      descriptionStyle={{
        fontSize: fp(16),
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
      }}
      bottomContainerStyle={{
        paddingHorizontal: wp(28),
        paddingTop: hp(12),
        backgroundColor: COLORS.background,
      }}
      bottomContent={
        <Animated.View entering={FadeInDown.delay(380).duration(500)}>
          <AuthActionButton
            label="시작하기"
            loading={isConfirming}
            disabled={isConfirming}
            onPress={() => void handleConfirm()}
            containerStyle={{
              backgroundColor: COLORS.primary,
              borderRadius: wp(30),
              paddingVertical: hp(16),
              alignItems: 'center',
            }}
            disabledContainerStyle={{ opacity: 0.7 }}
            textStyle={{
              fontSize: fp(20),
              fontFamily: FONTS.bold,
              color: COLORS.textInverse,
            }}
            loadingColor={COLORS.textInverse}
          />
        </Animated.View>
      }
    >
      <Animated.View
        entering={FadeInDown.delay(280).duration(500)}
        style={{ marginVertical: hp(24) }}
      >
        <KeyValueInfoCard
          items={summaryItems}
          containerStyle={{
            backgroundColor: COLORS.gray50,
            borderRadius: wp(18),
            paddingHorizontal: wp(20),
            paddingVertical: hp(20),
            gap: hp(14),
          }}
          rowStyle={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
          labelStyle={{
            width: wp(92),
            fontSize: fp(15),
            fontFamily: FONTS.medium,
            color: COLORS.textTertiary,
          }}
          valueStyle={{
            flex: 1,
            fontSize: fp(17),
            fontFamily: FONTS.semiBold,
            color: COLORS.textPrimary,
          }}
        />
      </Animated.View>
    </AuthStepLayout>
  );
}
