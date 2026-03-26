import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './FixedExpenseManageModal.styles';

interface FixedExpenseManageSummaryCardProps {
  totalAmount: number;
  onPressAdd: () => void;
}

export default function FixedExpenseManageSummaryCard({
  totalAmount,
  onPressAdd,
}: FixedExpenseManageSummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTopRow}>
        <View style={styles.summaryTextBlock}>
          <Text style={styles.summaryLabel}>이번 달 고정지출 합계</Text>
          <Text style={styles.summaryAmount}>{totalAmount.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity activeOpacity={0.88} style={styles.addButton} onPress={onPressAdd}>
          <Text style={styles.addButtonText}>+ 새 항목 추가</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.summaryHint}>
        자동이체나 반복 결제 내역을 등록해두면 매달 고정지출 관리가 더 쉬워집니다.
      </Text>
    </View>
  );
}
