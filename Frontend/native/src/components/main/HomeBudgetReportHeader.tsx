import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeBudgetReportCard.styles';

interface HomeBudgetReportHeaderProps {
  monthLabel: string;
  userName?: string | null;
}

export default function HomeBudgetReportHeader({
  monthLabel,
  userName,
}: HomeBudgetReportHeaderProps) {
  return (
    <View style={[styles.rowBetween, styles.heroTop]}>
      <View style={styles.flex1}>
        <Text style={styles.eyebrow}>{monthLabel}</Text>
        <Text style={styles.heroTitle}>
          {userName ? (
            <>
              <Text style={styles.heroTitleHighlight}>{userName}</Text>님의 예산 현황
            </>
          ) : (
            '이번 달 예산 리포트'
          )}
        </Text>
      </View>
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles-outline" size={wp(14)} color={COLORS.primary} />
        <Text style={styles.aiBadgeText}>AI</Text>
      </View>
    </View>
  );
}
