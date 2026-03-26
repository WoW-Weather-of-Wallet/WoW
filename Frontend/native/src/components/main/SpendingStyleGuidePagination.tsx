import React from 'react';
import { View } from 'react-native';

import { styles } from './SpendingStyleGuideModal.styles';

type SpendingStyleGuidePaginationProps = {
  totalCount: number;
  currentIndex: number;
};

export default function SpendingStyleGuidePagination({
  totalCount,
  currentIndex,
}: SpendingStyleGuidePaginationProps) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length: totalCount }).map((_, index) => (
        <View
          key={`spending-style-dot-${index}`}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );
}
