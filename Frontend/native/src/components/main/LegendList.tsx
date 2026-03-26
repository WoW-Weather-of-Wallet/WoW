import React from 'react';
import { View } from 'react-native';

import { COLORS, hp } from '../../constants/theme';
import type { LegendListItem } from '../../constants/main/types';
import LegendListRow from './LegendListRow';

interface LegendListProps {
  items: LegendListItem[];
  variant?: 'plain' | 'divider';
}

export default function LegendList({
  items,
  variant = 'plain',
}: LegendListProps) {
  const containerStyle = {
    gap: hp(10),
  } as const;

  const dividerStyle = {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: hp(16),
  } as const;

  return (
    <View style={[containerStyle, variant === 'divider' && dividerStyle]}>
      {items.map(item => (
        <LegendListRow key={item.id} item={item} />
      ))}
    </View>
  );
}
