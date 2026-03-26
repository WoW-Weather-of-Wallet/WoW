import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { styles } from './CalendarDayDetailSheet.styles';

interface CalendarDayDetailMemoSectionProps {
  memoValue: string;
  onChangeMemo: (value: string) => void;
  onSaveMemo: () => void;
}

export default function CalendarDayDetailMemoSection({
  memoValue,
  onChangeMemo,
  onSaveMemo,
}: CalendarDayDetailMemoSectionProps) {
  return (
    <>
      <View style={styles.memoSection}>
        <Text style={styles.memoTitle}>하루 메모</Text>
        <Text style={styles.memoHint}>
          오늘 소비에서 기억하고 싶은 점이나 다음에 참고할 내용을 자유롭게 남겨보세요.
        </Text>
        <TextInput
          value={memoValue}
          onChangeText={onChangeMemo}
          placeholder="오늘의 소비 메모를 적어보세요."
          placeholderTextColor={COLORS.textTertiary}
          style={styles.memoInput}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.saveButton} onPress={onSaveMemo}>
        <Text style={styles.saveButtonText}>메모 저장</Text>
      </TouchableOpacity>
    </>
  );
}
