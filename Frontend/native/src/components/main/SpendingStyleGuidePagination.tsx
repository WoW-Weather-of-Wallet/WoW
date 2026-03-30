import React from 'react';
import { View } from 'react-native';

import { COLORS, wp } from '../../constants/theme';

type SpendingStyleGuidePaginationProps = {
  totalCount: number;
  currentIndex: number;
};

export default function SpendingStyleGuidePagination({
  totalCount,
  currentIndex,
}: SpendingStyleGuidePaginationProps) {
  const paginationStyle = {
    gap: wp(6),
  } as const;

  const dotStyle = {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: COLORS.gray200,
  } as const;

  const activeDotStyle = {
    width: wp(18),
    backgroundColor: COLORS.primary,
  } as const;

  return (
    <View className="flex-row" style={paginationStyle}>
      {Array.from({ length: totalCount }).map((_, index) => (
        <View
          key={`spending-style-dot-${index}`}
          style={[dotStyle, currentIndex === index && activeDotStyle]}
        />
      ))}
    </View>
  );
}
