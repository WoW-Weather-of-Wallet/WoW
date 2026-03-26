import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeScheduleSection.styles';

interface HomeScheduleEmptyStateProps {
  title: string;
  description: string;
}

export default function HomeScheduleEmptyState({
  title,
  description,
}: HomeScheduleEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="calendar-clear-outline" size={wp(22)} color={COLORS.primary} />
      </View>
      <View style={styles.emptyTextWrap}>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>{description}</Text>
      </View>
    </View>
  );
}
