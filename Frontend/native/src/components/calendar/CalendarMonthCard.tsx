import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { WEATHER_ICONS, WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarMonthCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';
import MemoIcon from '../../../assets/imgs/calendar/MemoIcon';

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
                isSelected && styles.dayCellSelected,
                day.isFuture && styles.dayCellFuture,
              ]}
              onPress={() => onSelectDate(day.dateKey)}
            >
              {/*
                변경 전:
                - 메모 날짜에 연한 노란 배경과 이모지를 함께 표시했습니다.

                변경 이유:
                - 배경이 들어가면 날짜 숫자 위치가 시각적으로 밀려 보이고 셀 강조가 과해집니다.
                - 날짜 숫자는 기존 위치를 유지하고, 메모 표시는 상단 겹침 배지로만 처리합니다.
              */}
              {hasMemo ? (
                <View style={[styles.memoBadge, isSelected && styles.memoBadgeSelected]}>
                  {/*
                    변경 이유:
                    - 이모지 대신 디자인 자산 아이콘을 사용해 앱 전반의 시각 톤을 맞춥니다.
                    - SVG 아이콘은 플랫폼별 렌더링 차이가 적어서 크기/위치 조정도 안정적입니다.
                  */}
                  <MemoIcon size={11} />
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
