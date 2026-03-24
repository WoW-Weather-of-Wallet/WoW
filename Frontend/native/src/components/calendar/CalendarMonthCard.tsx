import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { WEATHER_ICONS, WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import type { CalendarDayItem } from '../../mock/calendar';

interface CalendarMonthCardProps {
  days: CalendarDayItem[];
  selectedDateKey?: string | null;
  onSelectDate: (dateKey: string) => void;
}

const toneDotColors = {
  primary: COLORS.primary,
  mint: '#7DD3A7',
  gold: '#E2BE63',
  rose: '#E97975',
} as const;

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

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  weekdaySunday: {
    color: '#E17272',
  },
  weekdaySaturday: {
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: hp(10),
  },
  dayCell: {
    width: '14.28%',
    minHeight: hp(66),
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: RADIUS.lg,
    paddingVertical: hp(7),
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  dayCellFuture: {
    opacity: 0.72,
  },
  dayCellPadding: {
    opacity: 0,
  },
  dayNumber: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(5),
  },
  dayNumberSelected: {
    color: COLORS.textInverse,
  },
  dayNumberPadding: {
    color: 'transparent',
  },
  cellIndicator: {
    minHeight: hp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIndicatorPadding: {
    opacity: 0,
  },
  toneDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
  },
  toneDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  amountText: {
    minHeight: fp(11),
    fontSize: fp(9),
    fontFamily: FONTS.medium,
    color: '#6FC48A',
    marginTop: hp(5),
  },
  amountTextSelected: {
    color: '#FFFFFF',
  },
  amountTextPadding: {
    color: 'transparent',
  },
  todayRing: {
    position: 'absolute',
    top: hp(3),
    width: wp(29),
    height: wp(29),
    borderRadius: wp(14.5),
    borderWidth: 1,
    borderColor: '#DCD7FF',
  },
});
