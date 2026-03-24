import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS } from '../../constants/theme';
import { styles } from './HomeCategorySection.styles';
import type { HomeSpendingCategory } from '../../mock/dashboard';

interface HomeCategorySectionProps {
  items: HomeSpendingCategory[];
}

export default function HomeCategorySection({
  items,
}: HomeCategorySectionProps) {
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            id: 'empty-category',
            label: '-',
            amount: 0,
            ratio: 0,
            color: COLORS.gray300,
          },
        ];

  return (
    <SurfaceCard>
      <SectionHeader title="카테고리별 소비" actionLabel="-" />
      {displayItems.map((category) => (
        <View key={category.id} style={styles.categoryBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <Text style={styles.categoryAmount}>
              {items.length > 0 ? `${category.amount.toLocaleString()}원` : '-'}
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
      ))}
    </SurfaceCard>
  );
}
