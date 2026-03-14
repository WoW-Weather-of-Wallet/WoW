import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface SelectableTransactionItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

interface FixedExpensePickerSheetProps {
  visible: boolean;
  items: SelectableTransactionItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * 전체내역에서 고정지출 후보 거래를 하나 고르는 단계입니다.
 */
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
      subtitle="고정지출로 등록할 항목을 선택하세요."
    >
      <TextInput
        placeholder="검색..."
        placeholderTextColor={COLORS.textTertiary}
        style={styles.searchInput}
      />

      <View style={styles.list}>
        {items.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.86}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => onSelect(item.id)}
            >
              <View style={styles.left}>
                <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={wp(18)}
                    color={COLORS.textPrimary}
                  />
                </View>

                <View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>
                    {item.category} · {item.dateLabel}
                  </Text>
                </View>
              </View>

              <Text style={styles.amount}>-₩{item.amount.toLocaleString()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity activeOpacity={0.88} style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>선택한 항목으로 다음</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  searchInput: {
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
  },
  list: {
    gap: hp(4),
    marginBottom: hp(18),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(12),
    paddingVertical: hp(14),
  },
  rowSelected: {
    backgroundColor: '#F2F0FF',
    borderWidth: 1,
    borderColor: '#D7D0FF',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    flex: 1,
  },
  iconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: '#D87272',
  },
  confirmButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(16),
  },
  confirmButtonText: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
