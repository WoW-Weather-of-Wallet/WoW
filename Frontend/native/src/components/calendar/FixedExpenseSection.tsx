import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SurfaceCard from '../common/SurfaceCard';
import { styles } from './FixedExpenseSection.styles';
import type { FixedExpenseItem } from '../../mock/calendar';
import FixedExpenseGroupBlock from './FixedExpenseGroupBlock';

interface FixedExpenseSectionProps {
  totalAmount: number;
  items: FixedExpenseItem[];
  detailItemsByCategory: Record<
    string,
    Array<{
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      isEnabled: boolean;
      category: string;
    }>
  >;
  onToggleExpand: (id: string) => void;
  onPressManage: () => void;
}

export default function FixedExpenseSection({
  totalAmount,
  items,
  detailItemsByCategory,
  onToggleExpand,
  onPressManage,
}: FixedExpenseSectionProps) {
  return (
      <SurfaceCard>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.pinEmoji}>📌</Text>
            <Text style={styles.headerTitle}>고정지출</Text>
          </View>
          <TouchableOpacity activeOpacity={0.86} onPress={onPressManage}>
            <Text style={styles.manageText}>관리</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalLabel}>
        {items.length > 0 ? `총 ${totalAmount.toLocaleString()}원` : '-'}
      </Text>

      <View style={styles.list}>
        {items.length === 0 ? (
          <Text style={styles.emptyDetailText}>-</Text>
        ) : (
          items.map((item) => {
            const detailItems = detailItemsByCategory[item.title] ?? [];

            return (
              <FixedExpenseGroupBlock
                key={item.id}
                item={item}
                detailItems={detailItems}
                onToggleExpand={onToggleExpand}
              />
            );
          })
        )}
      </View>
    </SurfaceCard>
  );
}
