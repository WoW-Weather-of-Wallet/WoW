import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { WEATHER_ICONS, WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarMonthCard.styles';
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
          const hasMemo = day.hasMemo && !isPaddingCell;

          return (
            <TouchableOpacity
              key={day.dateKey}
              activeOpacity={0.86}
              disabled={isPaddingCell}
              style={[
                styles.dayCell,
                isPaddingCell && styles.dayCellPadding,
                hasMemo && !isSelected && styles.dayCellMemo,
                isSelected && styles.dayCellSelected,
                day.isFuture && styles.dayCellFuture,
              ]}
              onPress={() => onSelectDate(day.dateKey)}
            >
              {/*
                메모 표시안 비교:
                - 연한 노란색 셀 배경
                - 날짜 위 메모 이모지
                두 방식을 같은 날짜에 함께 보여주고, 실제 화면에서 어떤 방식이 더 읽히는지 비교합니다.
              */}
              {hasMemo ? (
                <View style={[styles.memoBadge, isSelected && styles.memoBadgeSelected]}>
                  <Text style={[styles.memoEmoji, isSelected && styles.memoEmojiSelected]}>📝</Text>
                </View>
              ) : null}

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
                ) : null}
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
