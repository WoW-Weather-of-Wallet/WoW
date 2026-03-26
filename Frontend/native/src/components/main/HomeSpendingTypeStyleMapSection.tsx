import React from 'react';
import { Text, View } from 'react-native';
import type { SpendingStyleMetric } from '../../constants/main/types';
import HomeSpendingTypeSectionTitle from './HomeSpendingTypeSectionTitle';
import HomeSpendingTypeStyleMapContent from './HomeSpendingTypeStyleMapContent';
import { styles } from './HomeSpendingTypeSheet.styles';

interface HomeSpendingTypeStyleMapSectionProps {
  title: string;
  hasMetrics: boolean;
  metrics: SpendingStyleMetric[];
  emptyMessage: string;
}

export default function HomeSpendingTypeStyleMapSection({
  title,
  hasMetrics,
  metrics,
  emptyMessage,
}: HomeSpendingTypeStyleMapSectionProps) {
  return (
    <>
      <HomeSpendingTypeSectionTitle title={title} />
      {hasMetrics ? (
        <HomeSpendingTypeStyleMapContent metrics={metrics} />
      ) : (
        <View style={styles.styleMapCard}>
          <Text style={styles.introText}>{emptyMessage}</Text>
        </View>
      )}
    </>
  );
}
