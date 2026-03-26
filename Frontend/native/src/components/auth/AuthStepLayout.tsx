import React, { type RefObject } from 'react';
import {
  Platform,
  type ScrollView as ScrollViewType,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import StepIndicator from '../../components/common/StepIndicator';
import SafeAreaScrollLayout from '../../components/common/SafeAreaScrollLayout';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface AuthStepLayoutProps {
  currentStep: number;
  totalSteps?: number;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  scrollViewRef?: RefObject<ScrollViewType | null>;
  scrollContentPaddingTop: number;
  scrollContentPaddingBottom: number;
  bottomMinPadding?: number;
  bottomContent?: React.ReactNode;
  stepIndicatorContainerStyle?: StyleProp<ViewStyle>;
  titleSectionStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  bottomContainerStyle?: StyleProp<ViewStyle>;
}

const layoutStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  stepIndicatorContainer: {},
  titleSection: {
    marginBottom: hp(40),
  },
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(40),
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
  headerContent,
  scrollViewRef,
  scrollContentPaddingTop,
  scrollContentPaddingBottom,
  bottomMinPadding = hp(20),
  bottomContent,
  stepIndicatorContainerStyle,
  titleSectionStyle,
  titleStyle,
  descriptionStyle,
  bottomContainerStyle,
}: AuthStepLayoutProps) {
  return (
    <SafeAreaScrollLayout
      containerStyle={layoutStyles.container}
      scrollContentStyle={layoutStyles.scrollContent}
      scrollViewRef={scrollViewRef}
      scrollTopPadding={scrollContentPaddingTop}
      scrollBottomPadding={scrollContentPaddingBottom}
      bottomMinPadding={bottomMinPadding}
      bottomContainerStyle={[layoutStyles.bottomContainer, bottomContainerStyle]}
      bottomContent={bottomContent}
      keyboardVerticalOffset={Platform.OS === 'ios' ? hp(20) : 0}
    >
      <View style={[layoutStyles.stepIndicatorContainer, stepIndicatorContainerStyle]}>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {headerContent}

      <View style={[layoutStyles.titleSection, titleSectionStyle]}>
        <Text style={[layoutStyles.title, titleStyle]}>{title}</Text>
        {description ? (
          <Text style={[layoutStyles.description, descriptionStyle]}>
            {description}
          </Text>
        ) : null}
      </View>

      {children}
    </SafeAreaScrollLayout>
  );
}
