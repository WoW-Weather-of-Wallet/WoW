import React from 'react';
import { View } from 'react-native';

import type { SpendingStyleMetric } from '../../constants/main/types';
import { hp, wp } from '../../constants/theme';
import LegendList from './LegendList';
import SpendingStyleRadarChart from './SpendingStyleRadarChart';

type HomeSpendingTypeStyleMapContentProps = {
  metrics: SpendingStyleMetric[];
};

export default function HomeSpendingTypeStyleMapContent({
  metrics,
}: HomeSpendingTypeStyleMapContentProps) {
  const cardStyle = {
    gap: wp(18),
    marginBottom: hp(20),
  } as const;

  return (
    <View className="flex-row items-center" style={cardStyle}>
      <SpendingStyleRadarChart metrics={metrics} />
      <View className="flex-1 justify-center">
        <LegendList items={metrics} />
      </View>
    </View>
  );
}
