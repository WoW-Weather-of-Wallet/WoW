import React from 'react';
import { Text, View } from 'react-native';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { styles } from './HomeCategorySection.styles';
import type { HomeSpendingCategory } from '../../mock/dashboard';

interface HomeCategorySectionProps {
  items: HomeSpendingCategory[];
}

export default function HomeCategorySection({
  items,
}: HomeCategorySectionProps) {
  return (
    <SurfaceCard>
      <SectionHeader title="카테고리별 소비" actionLabel="상세 분석" />
      {items.map((category) => (
        <View key={category.id} style={styles.categoryBlock}>
          <View style={styles.rowBetween}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <Text style={styles.categoryAmount}>
              {category.amount.toLocaleString()}원
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

