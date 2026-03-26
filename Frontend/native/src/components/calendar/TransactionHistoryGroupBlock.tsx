import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './TransactionHistorySection.styles';
import type { CalendarTransactionGroup } from '../../mock/calendar';

interface TransactionHistoryGroupBlockProps {
  group: CalendarTransactionGroup;
}

export default function TransactionHistoryGroupBlock({
  group,
}: TransactionHistoryGroupBlockProps) {
  return (
    <View style={styles.groupBlock}>
      <Text style={styles.groupLabel}>{group.dateLabel}</Text>

      <View style={styles.groupCard}>
        {group.items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.rowCard, index < group.items.length - 1 && styles.rowDivider]}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: item.iconTone }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={wp(20)}
                  color={COLORS.textPrimary}
                />
              </View>

              <View style={styles.textBlock}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.isFixedExpense ? (
                    <Text style={styles.fixedPinEmoji}>📌</Text>
                  ) : null}
                </View>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
            </View>

            <View style={styles.amountBlock}>
              <Text style={[styles.amount, item.amount < 0 && styles.incomeAmount]}>
                {item.amount < 0 ? '+' : '-'}₩{Math.abs(item.amount).toLocaleString()}
              </Text>
              {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
