import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarHeroCard.styles';

interface CalendarHeroSummaryRowProps {
  label: string;
  amountText: string;
  goalLabel: string;
}

export default function CalendarHeroSummaryRow({
  label,
  amountText,
  goalLabel,
}: CalendarHeroSummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryAmount}>{amountText}</Text>
      </View>

      <View style={styles.goalBadge}>
        <Ionicons name="bulb-outline" size={wp(13)} color={COLORS.primary} />
        <Text style={styles.goalBadgeText}>{goalLabel}</Text>
      </View>
    </View>
  );
}
