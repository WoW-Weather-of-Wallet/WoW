import React from 'react';
import { Text, View } from 'react-native';
import type { SpendingStyleMetric } from '../../constants/main/types';
import LegendList from './LegendList';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';
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
      <Text style={styles.sheetSectionTitle}>{title}</Text>
      <View style={styles.styleMapCard}>
        {hasMetrics ? (
          <>
            <SpendingStyleRadarChart metrics={metrics} />
            <View style={styles.styleLegend}>
              <LegendList items={metrics} />
            </View>
          </>
        ) : (
          <Text style={styles.introText}>{emptyMessage}</Text>
        )}
      </View>
    </>
  );
}
