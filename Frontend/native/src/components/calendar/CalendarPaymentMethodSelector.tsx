import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { ManualEntryPaymentMethod } from '../../types/calendar';
import { styles } from './CalendarAddEntrySheet.styles';

const PAYMENT_METHOD_OPTIONS: Array<{
  key: ManualEntryPaymentMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'card', label: '카드', icon: 'card-outline' },
  { key: 'cash', label: '현금', icon: 'cash-outline' },
];

interface CalendarPaymentMethodSelectorProps {
  selectedPaymentMethod: ManualEntryPaymentMethod | null;
  onSelect: (method: ManualEntryPaymentMethod) => void;
}

export default function CalendarPaymentMethodSelector({
  selectedPaymentMethod,
  onSelect,
}: CalendarPaymentMethodSelectorProps) {
  return (
    <View style={styles.paymentMethodGrid}>
      {PAYMENT_METHOD_OPTIONS.map((method) => {
        const isActive = selectedPaymentMethod === method.key;

        return (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.88}
            style={[styles.paymentMethodChip, isActive && styles.paymentMethodChipActive]}
            onPress={() => onSelect(method.key)}
          >
            <Ionicons
              name={method.icon}
              size={wp(15)}
              color={isActive ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.paymentMethodChipText,
                isActive && styles.paymentMethodChipTextActive,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
