import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { CalendarTransactionItem } from '../../mock/calendar';
import { styles } from './CalendarDayDetailSheet.styles';

interface CalendarDayDetailTransactionRowProps {
  item: CalendarTransactionItem;
}

export default function CalendarDayDetailTransactionRow({
  item,
}: CalendarDayDetailTransactionRowProps) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={wp(18)}
            color={COLORS.textPrimary}
          />
        </View>
        <View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.itemAmount}>-₩{item.amount.toLocaleString()}</Text>
    </View>
  );
}
