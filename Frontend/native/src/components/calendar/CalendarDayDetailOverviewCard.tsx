import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import type { CalendarDayDetail } from '../../mock/calendar';
import { styles } from './CalendarDayDetailSheet.styles';

interface CalendarDayDetailOverviewCardProps {
  detail: CalendarDayDetail;
}

function getWeatherIconName(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return 'moon-outline' as const;
  }

  return detail.weatherLabel === '맑음' ? 'sunny-outline' : 'partly-sunny-outline';
}

function getSpentAmountLabel(detail: CalendarDayDetail) {
  if (detail.spentAmount === null) {
    return '-';
  }

  return `-${detail.spentAmount.toLocaleString()}원`;
}

function getTransactionCountLabel(detail: CalendarDayDetail) {
  if (detail.transactionCount === null) {
    return '-';
  }

  return `${detail.transactionCount}건`;
}

export default function CalendarDayDetailOverviewCard({
  detail,
}: CalendarDayDetailOverviewCardProps) {
  return (
    <>
      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <Ionicons name={getWeatherIconName(detail)} size={wp(28)} color={COLORS.primary} />
          <View>
            <Text style={styles.weatherLabel}>{detail.weatherLabel}</Text>
            <Text style={styles.weatherHint}>{detail.weatherHint}</Text>
          </View>
        </View>
        <Text style={styles.temperature}>{detail.weatherTemperature}</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>지출액</Text>
          <Text style={[styles.metricValue, styles.metricSpent]}>
            {getSpentAmountLabel(detail)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>거래 건수</Text>
          <Text style={[styles.metricValue, styles.metricCount]}>
            {getTransactionCountLabel(detail)}
          </Text>
        </View>
      </View>
    </>
  );
}
