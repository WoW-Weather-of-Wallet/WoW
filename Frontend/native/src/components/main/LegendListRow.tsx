import React from 'react';
import { Text, View } from 'react-native';

import type { LegendListItem } from '../../constants/main/types';
import { styles } from './LegendList.styles';

type LegendListRowProps = {
  item: LegendListItem;
};

export default function LegendListRow({ item }: LegendListRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
    </View>
  );
}
