import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '../common/SectionHeader';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './HomeWeeklyPreviewCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';

const previewWeatherIcons = {
  rainy: 'rainy-outline',
  cloudy: 'partly-sunny-outline',
  sunny: 'sunny-outline',
  clear: 'moon-outline',
} as const;

interface HomeWeeklyPreviewCardProps {
  items: CalendarDayItem[];
}

export default function HomeWeeklyPreviewCard({ items }: HomeWeeklyPreviewCardProps) {
  const displayItems =
    items.length > 0
      ? items
      : Array.from({ length: 7 }, (_, index) => ({
          dateKey: `empty-week-${index}`,
          dayNumber: index + 1,
          amount: undefined,
          tone: 'mint' as const,
          weatherTone: undefined,
          isCurrentMonth: true,
          isToday: false,
          isFuture: false,
        }));

  return (
    <SurfaceCard>
      <SectionHeader title="주간 미리보기" actionLabel="-" />
      <View style={styles.previewStrip}>
        {displayItems.map((day, index) => (
          <View key={day.dateKey} style={styles.previewDayColumn}>
            <Text
              style={[
                styles.previewWeekday,
                index === 0 && styles.previewWeekdaySunday,
                index === 6 && styles.previewWeekdaySaturday,
              ]}
            >
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][index]}
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
        ))}
      </View>
    </SurfaceCard>
  );
}
