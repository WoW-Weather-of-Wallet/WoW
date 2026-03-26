import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeSpendingTypeCard.styles';

interface HomeSpendingTypeCardHeaderProps {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
}

export default function HomeSpendingTypeCardHeader({
  title,
  iconName,
}: HomeSpendingTypeCardHeaderProps) {
  return (
    <View style={styles.rowBetween}>
      <View style={styles.flex1}>
        <Text style={styles.eyebrow}>AI 소비 유형 분석</Text>
        <View style={styles.titleRow}>
          <View style={styles.iconBadge}>
            <Ionicons name={iconName} size={wp(18)} color={COLORS.primary} />
          </View>
          <Text style={styles.mainTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles-outline" size={wp(14)} color={COLORS.primary} />
        <Text style={styles.aiBadgeText}>AI 리포트</Text>
      </View>
    </View>
  );
}
