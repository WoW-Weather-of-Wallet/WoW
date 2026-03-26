import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './FixedExpensePickerSheet.styles';

export interface SelectableTransactionItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

interface FixedExpensePickerRowProps {
  item: SelectableTransactionItem;
  isSelected: boolean;
  onPress: (id: string) => void;
}

export default function FixedExpensePickerRow({
  item,
  isSelected,
  onPress,
}: FixedExpensePickerRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={() => onPress(item.id)}
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

      <Text style={styles.amount}>-{item.amount.toLocaleString()}원</Text>
    </TouchableOpacity>
  );
}
