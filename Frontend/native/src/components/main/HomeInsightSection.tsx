import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { styles } from './HomeInsightSection.styles';
import type { HomeInsight } from '../../mock/dashboard';

interface HomeInsightSectionProps {
  items: HomeInsight[];
}

export default function HomeInsightSection({
  items,
}: HomeInsightSectionProps) {
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            id: 'empty-insight',
            label: '-',
            value: '-',
            changeText: '-',
          },
        ];

  return (
    <SurfaceCard>
      <SectionHeader title="소비 인사이트" actionLabel="-" />
      {displayItems.map((item) => (
        <View key={item.id} style={styles.infoCard}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
          <Text style={styles.infoChange}>{item.changeText}</Text>
        </View>
      ))}
    </SurfaceCard>
  );
}
