import React from 'react';
import { View } from 'react-native';

import type { SpendingStyleMetric } from '../../constants/main/types';
import LegendList from './LegendList';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';
import { styles } from './HomeSpendingTypeSheet.styles';

type HomeSpendingTypeStyleMapContentProps = {
  metrics: SpendingStyleMetric[];
};

export default function HomeSpendingTypeStyleMapContent({
  metrics,
}: HomeSpendingTypeStyleMapContentProps) {
  return (
    <View style={styles.styleMapCard}>
      <SpendingStyleRadarChart metrics={metrics} />
      <View style={styles.styleLegend}>
        <LegendList items={metrics} />
      </View>
    </View>
  );
}
