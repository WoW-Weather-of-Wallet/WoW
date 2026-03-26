import React from 'react';
import { Text, View } from 'react-native';
import SurfaceCard from '../common/SurfaceCard';
import { WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { styles } from './CalendarMonthCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';
import CalendarDayCell from './CalendarDayCell';

interface CalendarMonthCardProps {
  days: CalendarDayItem[];
  selectedDateKey?: string | null;
  onSelectDate: (dateKey: string) => void;
}

/**
 * 월간 달력 그리드.
 * 날짜 선택, 오늘 강조, 미래 날짜 표현을 한곳에서 처리한다.
 */
export default function CalendarMonthCard({
  days,
  selectedDateKey,
  onSelectDate,
}: CalendarMonthCardProps) {
  return (
    <SurfaceCard>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={label}
            style={[
              styles.weekdayLabel,
              index === 0 && styles.weekdaySunday,
              index === 6 && styles.weekdaySaturday,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => (
          <CalendarDayCell
            key={day.dateKey}
            day={day}
            isSelected={selectedDateKey === day.dateKey}
            onPress={onSelectDate}
          />
        ))}
      </View>
    </SurfaceCard>
  );
}
