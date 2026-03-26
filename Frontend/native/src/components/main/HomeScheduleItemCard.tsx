import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './HomeScheduleSection.styles';
import type { HomeScheduleItem } from '../../mock/dashboard';

interface HomeScheduleItemCardProps {
  item: HomeScheduleItem;
}

export default function HomeScheduleItemCard({ item }: HomeScheduleItemCardProps) {
  const isPaid = item.status === 'paid';

  return (
    <View style={styles.scheduleCard}>
      <View style={styles.flex1}>
        <Text style={styles.scheduleTitle}>{item.title}</Text>
        <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
      </View>
      <View style={styles.scheduleRight}>
        <Text style={styles.scheduleAmount}>{item.amount}</Text>
        <View
          style={[
            styles.statusChip,
            isPaid ? styles.statusChipDone : styles.statusChipUpcoming,
          ]}
        >
          <Text
            style={[
              styles.statusChipText,
              isPaid ? styles.statusChipTextDone : styles.statusChipTextUpcoming,
            ]}
          >
            {isPaid ? '완료' : '예정'}
          </Text>
        </View>
      </View>
    </View>
  );
}
