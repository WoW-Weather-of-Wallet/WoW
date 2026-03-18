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

/**
 * 홈 상단에 보여주는 짧은 주간 예보 미리보기 카드.
 * 캘린더 화면의 데이터를 재사용해 메인에서도 흐름을 빠르게 파악할 수 있게 한다.
 */
export default function HomeWeeklyPreviewCard({ items }: HomeWeeklyPreviewCardProps) {
  return (
    <SurfaceCard>
      <SectionHeader title="1주일 예보 미리보기" actionLabel="상세보기" />
      <View style={styles.previewStrip}>
        {items.map((day, index) => (
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

