import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { ManualEntryPaymentMethod } from '../../types/calendar';

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
    <View className="flex-row" style={{ gap: wp(10) }}>
      {PAYMENT_METHOD_OPTIONS.map((method) => {
        const isActive = selectedPaymentMethod === method.key;

        return (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.88}
            className="flex-1 flex-row items-center justify-center"
            style={{
              minHeight: hp(48),
              gap: wp(6),
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: isActive ? COLORS.primary : COLORS.chipBorder,
              backgroundColor: isActive ? COLORS.primary : COLORS.white,
            }}
            onPress={() => onSelect(method.key)}
          >
            <Ionicons
              name={method.icon}
              size={wp(15)}
              color={isActive ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: isActive ? COLORS.white : COLORS.textPrimary,
              }}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
