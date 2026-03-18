import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { WEATHER_ICONS, WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, wp } from '../../constants/theme';
import { styles, toneDotColors } from './CalendarMonthCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';

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
        {days.map((day) => {
          const isSelected = selectedDateKey === day.dateKey;
          const isPaddingCell = !day.isCurrentMonth;

          return (
            <TouchableOpacity
              key={day.dateKey}
              activeOpacity={0.86}
              disabled={isPaddingCell}
              style={[
                styles.dayCell,
                isPaddingCell && styles.dayCellPadding,
                isSelected && styles.dayCellSelected,
                day.isFuture && styles.dayCellFuture,
              ]}
              onPress={() => onSelectDate(day.dateKey)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isPaddingCell && styles.dayNumberPadding,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.dayNumber}
              </Text>

              <View style={[styles.cellIndicator, isPaddingCell && styles.cellIndicatorPadding]}>
                {day.weatherTone ? (
                  <Ionicons
                    name={WEATHER_ICONS[day.weatherTone]}
                    size={wp(13)}
                    color={isSelected ? COLORS.textInverse : COLORS.primary}
                  />
                ) : (
                  <View
                    style={[
                      styles.toneDot,
                      { backgroundColor: toneDotColors[day.tone] },
                      isSelected && styles.toneDotSelected,
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.amountText,
                  isPaddingCell && styles.amountTextPadding,
                  isSelected && styles.amountTextSelected,
                ]}
              >
                {typeof day.amount === 'number' && day.amount > 0
                  ? day.amount.toLocaleString()
                  : day.isFuture
                    ? ''
                    : '-'}
              </Text>

              {day.isToday && !isSelected ? <View style={styles.todayRing} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </SurfaceCard>
  );
}

