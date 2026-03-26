import React, { type ReactNode } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import SafeAreaScrollLayout from './SafeAreaScrollLayout';
import StepIndicator from './StepIndicator';
import { COLORS, hp, wp } from '../../constants/theme';

interface IdentityStepFormLayoutProps {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  bottomContent: ReactNode;
  onBack: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  scrollContentStyle?: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  stepIndicatorContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  bottomContainerStyle?: StyleProp<ViewStyle>;
  currentStep?: number;
  totalSteps?: number;
  compactStepIndicator?: boolean;
  scrollTopPadding?: number;
  scrollBottomPadding?: number;
  bottomMinPadding?: number;
  backIconSize?: number;
  backIconColor?: string;
}

export default function IdentityStepFormLayout({
  title,
  subtitle,
  children,
  bottomContent,
  onBack,
  containerStyle,
  scrollContentStyle,
  backButtonStyle,
  stepIndicatorContainerStyle,
  titleStyle,
  subtitleStyle,
  bottomContainerStyle,
  currentStep = 1,
  totalSteps = 2,
  compactStepIndicator = true,
  scrollTopPadding = hp(28),
  scrollBottomPadding = hp(28),
  bottomMinPadding = hp(24),
  backIconSize = wp(24),
  backIconColor = COLORS.textPrimary,
}: IdentityStepFormLayoutProps) {
  return (
    <SafeAreaScrollLayout
      containerStyle={containerStyle}
      scrollContentStyle={scrollContentStyle}
      scrollTopPadding={scrollTopPadding}
      scrollBottomPadding={scrollBottomPadding}
      bottomMinPadding={bottomMinPadding}
      bottomContainerStyle={bottomContainerStyle}
      bottomContent={bottomContent}
    >
      <TouchableOpacity style={backButtonStyle} onPress={onBack}>
        <Ionicons
          name="chevron-back"
          size={backIconSize}
          color={backIconColor}
        />
      </TouchableOpacity>

      <View style={stepIndicatorContainerStyle}>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          compact={compactStepIndicator}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={subtitleStyle}>{subtitle}</Text>
      </Animated.View>

      {children}
    </SafeAreaScrollLayout>
  );
}
