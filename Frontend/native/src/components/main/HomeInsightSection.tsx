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
  return (
    <SurfaceCard>
      <SectionHeader title="이번 달 핵심 지표" actionLabel="더보기" />
      {items.map((item) => (
        <View key={item.id} style={styles.infoCard}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{item.value}</Text>
          <Text style={styles.infoChange}>{item.changeText}</Text>
        </View>
      ))}
    </SurfaceCard>
  );
}

