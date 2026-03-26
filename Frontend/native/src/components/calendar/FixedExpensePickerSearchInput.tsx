import React from 'react';
import { TextInput } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from './FixedExpensePickerSheet.styles';

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
      placeholder="거래내역 검색"
      placeholderTextColor={COLORS.textTertiary}
      style={styles.searchInput}
    />
  );
}
