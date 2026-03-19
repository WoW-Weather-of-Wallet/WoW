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
  return (
    <SurfaceCard>
      <SectionHeader title="다가오는 결제 일정" actionLabel="3건" />
      {items.map((item) => (
        <View key={item.id} style={styles.scheduleCard}>
          <View style={styles.flex1}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
          </View>
          <View style={styles.scheduleRight}>
            <Text style={styles.scheduleAmount}>{item.amount}</Text>
            <Text style={styles.scheduleStatus}>
              {item.status === 'paid' ? '완료' : '예정'}
            </Text>
          </View>
        </View>
      ))}
    </SurfaceCard>
  );
}

