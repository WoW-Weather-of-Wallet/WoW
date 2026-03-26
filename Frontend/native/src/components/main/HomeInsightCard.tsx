import React from 'react';
import { Text, View } from 'react-native';

import type { HomeInsight } from '../../mock/dashboard';
import { styles } from './HomeInsightSection.styles';

type HomeInsightCardProps = {
  item: HomeInsight;
};

export default function HomeInsightCard({ item }: HomeInsightCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{item.label}</Text>
      <Text style={styles.infoValue}>{item.value}</Text>
      <Text style={styles.infoChange}>{item.changeText}</Text>
    </View>
  );
}
