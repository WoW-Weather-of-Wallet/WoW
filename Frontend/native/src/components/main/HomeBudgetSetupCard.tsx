import React from 'react';
import { Text, View } from 'react-native';

import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import CustomTextInput from '../common/CustomTextInput';
import GradientButton from '../common/GradientButton';

interface HomeBudgetSetupCardProps {
  title: string;
  description: string;
  inputLabel: string;
  buttonTitle: string;
  budgetAmount: string;
  isDisabled: boolean;
  onBudgetAmountChange: (value: string) => void;
  onSubmit: () => void;
}

export default function HomeBudgetSetupCard({
  title,
  description,
  inputLabel,
  buttonTitle,
  budgetAmount,
  isDisabled,
  onBudgetAmountChange,
  onSubmit,
}: HomeBudgetSetupCardProps) {
  const cardStyle = {
    gap: hp(12),
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(20),
  } as const;

  const titleStyle = {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  } as const;

  const descriptionStyle = {
    fontSize: fp(13),
    lineHeight: fp(20),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  } as const;

  return (
    <View style={cardStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={descriptionStyle}>{description}</Text>
      <CustomTextInput
        label={inputLabel}
        value={budgetAmount}
        onChangeText={onBudgetAmountChange}
        keyboardType="numeric"
      />
      <GradientButton
        title={buttonTitle}
        onPress={onSubmit}
        disabled={isDisabled}
        style={isDisabled ? { opacity: 0.45 } : undefined}
      />
    </View>
  );
}
