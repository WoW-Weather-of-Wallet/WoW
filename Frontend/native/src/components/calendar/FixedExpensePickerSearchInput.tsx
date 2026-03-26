import React from 'react';
import { TextInput } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface FixedExpensePickerSearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
}

export default function FixedExpensePickerSearchInput({
  value,
  onChangeText,
}: FixedExpensePickerSearchInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={'\uAC70\uB798 \uB0B4\uC5ED\uC744 \uAC80\uC0C9\uD574\uBCF4\uC138\uC694'}
      placeholderTextColor={COLORS.textTertiary}
      style={{
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        paddingHorizontal: wp(16),
        paddingVertical: hp(14),
        fontSize: fp(15),
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
        marginBottom: hp(18),
      }}
    />
  );
}
