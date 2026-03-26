import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, wp } from '../../constants/theme';
import type { CalendarDayItem } from '../../mock/calendar';
import { styles } from './HomeWeeklyPreviewCard.styles';

const previewWeatherIcons = {
  rainy: 'rainy-outline',
  cloudy: 'partly-sunny-outline',
  sunny: 'sunny-outline',
  clear: 'moon-outline',
} as const;

type HomeWeeklyPreviewDayColumnProps = {
  day: CalendarDayItem;
  weekdayLabel: string;
  index: number;
};

export default function HomeWeeklyPreviewDayColumn({
  day,
  weekdayLabel,
  index,
}: HomeWeeklyPreviewDayColumnProps) {
  return (
    <View style={styles.previewDayColumn}>
      <Text
        style={[
          styles.previewWeekday,
          index === 0 && styles.previewWeekdaySunday,
          index === 6 && styles.previewWeekdaySaturday,
        ]}
      >
        {weekdayLabel}
      </Text>
      <Text style={styles.previewDayNumber}>{day.dayNumber}</Text>
      {day.weatherTone ? (
        <Ionicons
          name={previewWeatherIcons[day.weatherTone]}
          size={wp(14)}
          color={COLORS.primary}
        />
      ) : (
        <View style={styles.previewPlaceholder} />
      )}
      <Text style={styles.previewAmount}>
        {typeof day.amount === 'number' ? day.amount.toLocaleString() : '-'}
      </Text>
    </View>
  );
}
