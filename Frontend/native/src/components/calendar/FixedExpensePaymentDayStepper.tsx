import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './FixedExpenseDetailSheet.styles';

interface FixedExpensePaymentDayStepperProps {
  paymentDay: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function FixedExpensePaymentDayStepper({
  paymentDay,
  onDecrease,
  onIncrease,
}: FixedExpensePaymentDayStepperProps) {
  return (
    <View style={styles.stepperCard}>
      <TouchableOpacity activeOpacity={0.86} style={styles.stepperButton} onPress={onDecrease}>
        <Text style={styles.stepperButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{paymentDay}</Text>
      <TouchableOpacity activeOpacity={0.86} style={styles.stepperButton} onPress={onIncrease}>
        <Text style={styles.stepperButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
