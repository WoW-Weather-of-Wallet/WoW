import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { FixedExpenseDetailItem } from '../../hooks';
import { styles } from './FixedExpenseDetailSheet.styles';

interface FixedExpenseSelectedSummaryCardProps {
  item: FixedExpenseDetailItem;
}

export default function FixedExpenseSelectedSummaryCard({
  item,
}: FixedExpenseSelectedSummaryCardProps) {
  return (
    <View style={styles.selectedCard}>
      <View style={styles.selectedLeft}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={wp(18)}
            color={item.iconTone === '#111111' ? COLORS.white : COLORS.textPrimary}
          />
        </View>
        <View>
          <Text style={styles.selectedTitle}>{item.title}</Text>
          <Text style={styles.selectedAmount}>-{item.amount.toLocaleString()}원</Text>
        </View>
      </View>
      <Ionicons name="pin" size={wp(18)} color={COLORS.primary} />
    </View>
  );
}
