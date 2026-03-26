import React from 'react';
import { Text, View } from 'react-native';

import type { HomeSpendingCategory } from '../../mock/dashboard';
import { styles } from './HomeCategorySection.styles';

type HomeCategoryItemRowProps = {
  category: HomeSpendingCategory;
  showAmount?: boolean;
};

export default function HomeCategoryItemRow({
  category,
  showAmount = true,
}: HomeCategoryItemRowProps) {
  return (
    <View style={styles.categoryBlock}>
      <View style={styles.rowBetween}>
        <Text style={styles.categoryTitle}>{category.label}</Text>
        <Text style={styles.categoryAmount}>
          {showAmount ? `${category.amount.toLocaleString()}??` : '-'}
        </Text>
      </View>
      <View style={styles.categoryBarTrack}>
        <View
          style={[
            styles.categoryBarFill,
            {
              width: `${Math.round(category.ratio * 100)}%`,
              backgroundColor: category.color,
            },
          ]}
        />
      </View>
    </View>
  );
}
