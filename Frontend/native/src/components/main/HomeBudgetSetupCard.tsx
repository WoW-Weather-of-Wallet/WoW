import React from 'react';
import { Text, View } from 'react-native';
import CustomTextInput from '../common/CustomTextInput';
import GradientButton from '../common/GradientButton';
import { styles } from './HomeMonthlyReportSheet.styles';

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
  return (
    <View style={styles.budgetFormCard}>
      <Text style={styles.budgetFormTitle}>{title}</Text>
      <Text style={styles.budgetFormDescription}>{description}</Text>
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
        style={isDisabled ? styles.disabledBudgetButton : undefined}
      />
    </View>
  );
}
