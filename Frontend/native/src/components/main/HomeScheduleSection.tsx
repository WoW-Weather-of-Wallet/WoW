import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { styles } from './HomeScheduleSection.styles';
import type { HomeScheduleItem } from '../../mock/dashboard';

interface HomeScheduleSectionProps {
  items: HomeScheduleItem[];
}

export default function HomeScheduleSection({
  items,
}: HomeScheduleSectionProps) {
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            id: 'empty-schedule',
            title: '-',
            dueLabel: '-',
            amount: '-',
            status: 'upcoming' as const,
          },
        ];

  return (
    <SurfaceCard>
      <SectionHeader title="일정" actionLabel="-" />
      {displayItems.map((item) => (
        <View key={item.id} style={styles.scheduleCard}>
          <View style={styles.flex1}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
          </View>
          <View style={styles.scheduleRight}>
            <Text style={styles.scheduleAmount}>{item.amount}</Text>
            <Text style={styles.scheduleStatus}>
              {items.length === 0 ? '-' : item.status === 'paid' ? '완료' : '예정'}
            </Text>
          </View>
        </View>
      ))}
    </SurfaceCard>
  );
}
