import React from 'react';
import { View } from 'react-native';
import { styles } from './LegendList.styles';
import type { LegendListItem } from '../../constants/main/types';
import LegendListRow from './LegendListRow';

interface LegendListProps {
  items: LegendListItem[];
  variant?: 'plain' | 'divider';
}

// 범례는 레이더 차트와 월간 비교 시트에서 공통으로 재사용합니다.
export default function LegendList({
  items,
  variant = 'plain',
}: LegendListProps) {
  return (
    <View style={[styles.container, variant === 'divider' && styles.dividerContainer]}>
      {items.map(item => (
        <LegendListRow key={item.id} item={item} />
      ))}
    </View>
  );
}

