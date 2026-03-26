import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeMonthlyReportSheet.styles';

interface HomeMonthlyInsightCardProps {
  text: string;
}

export default function HomeMonthlyInsightCard({ text }: HomeMonthlyInsightCardProps) {
  return (
    <View style={styles.insightCard}>
      <Ionicons name="bar-chart-outline" size={wp(22)} color={COLORS.primary} />
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}
