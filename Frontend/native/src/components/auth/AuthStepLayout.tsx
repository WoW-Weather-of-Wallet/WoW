import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepIndicator from '../../components/common/StepIndicator';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface AuthStepLayoutProps {
  currentStep: number;
  totalSteps?: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  scrollViewRef?: React.RefObject<ScrollViewType | null>;
  scrollContentPaddingTop: number;
  scrollContentPaddingBottom: number;
  bottomMinPadding?: number;
  bottomContent?: React.ReactNode;
}

const layoutStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(40),
    marginBottom: hp(40),
    letterSpacing: -0.5,
  },
  description: {
    color: COLORS.textTertiary,
    marginTop: hp(12),
    lineHeight: hp(22),
  },
  bottomContainer: {
    paddingHorizontal: wp(28),
    backgroundColor: COLORS.background,
    paddingTop: hp(12),
  },
};

export default function AuthStepLayout({
  currentStep,
  totalSteps = 5,
  title,
  description,
  children,
  scrollViewRef,
  scrollContentPaddingTop,
  scrollContentPaddingBottom,
  bottomMinPadding = hp(20),
  bottomContent,
}: AuthStepLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={layoutStyles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          layoutStyles.scrollContent,
          {
            paddingTop: insets.top + scrollContentPaddingTop,
            paddingBottom: insets.bottom + scrollContentPaddingBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <Text style={layoutStyles.title}>{title}</Text>

        {description ? <Text style={layoutStyles.description}>{description}</Text> : null}

        {children}
      </ScrollView>

      {bottomContent ? (
        <View
          style={[
            layoutStyles.bottomContainer,
            { paddingBottom: Math.max(insets.bottom, bottomMinPadding) },
          ]}
        >
          {bottomContent}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
