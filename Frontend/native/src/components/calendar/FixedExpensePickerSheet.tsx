import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS } from '../../constants/theme';
import FixedExpensePickerRow, { type SelectableTransactionItem } from './FixedExpensePickerRow';
import { styles } from './FixedExpensePickerSheet.styles';

interface FixedExpensePickerSheetProps {
  visible: boolean;
  items: SelectableTransactionItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function FixedExpensePickerSheet({
  visible,
  items,
  selectedId,
  onSelect,
  onConfirm,
  onClose,
}: FixedExpensePickerSheetProps) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="전체내역에서 선택"
      subtitle="고정지출로 등록할 항목을 선택하세요"
    >
      <TextInput
        placeholder="검색..."
        placeholderTextColor={COLORS.textTertiary}
        style={styles.searchInput}
      />

      <View style={styles.list}>
        {items.map((item) => (
          <FixedExpensePickerRow
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onPress={onSelect}
          />
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>선택한 항목으로 다음</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
