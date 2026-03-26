import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../common/BottomSheetModal';
import { useFixedExpensePickerSearch } from '../../hooks/useFixedExpensePickerSearch';
import FixedExpensePickerRow, { type SelectableTransactionItem } from './FixedExpensePickerRow';
import FixedExpensePickerSearchInput from './FixedExpensePickerSearchInput';
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
  const { query, setQuery, filteredItems, hasQuery } = useFixedExpensePickerSearch(items);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="고정지출로 등록할 거래 선택"
      subtitle="고정지출로 관리할 거래를 선택한 뒤 다음 단계로 이동하세요."
    >
      <FixedExpensePickerSearchInput value={query} onChangeText={setQuery} />

      <View style={styles.list}>
        {filteredItems.map((item) => (
          <FixedExpensePickerRow
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onPress={onSelect}
          />
        ))}

        {filteredItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {hasQuery ? '검색 결과가 없습니다' : '선택할 거래가 없습니다'}
            </Text>
            <Text style={styles.emptyDescription}>
              {hasQuery
                ? '검색어를 바꾸거나 초기화한 뒤 다시 확인해주세요.'
                : '먼저 캘린더 거래 내역을 불러온 뒤 다시 시도해주세요.'}
            </Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>선택한 거래로 이동</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
