import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WEATHER_ICONS } from '../../constants/calendar/ui';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './CalendarMonthCard.styles';
import type { CalendarDayItem } from '../../mock/calendar';
import MemoIcon from '../../../assets/imgs/calendar/MemoIcon';

interface CalendarDayCellProps {
  day: CalendarDayItem;
  isSelected: boolean;
  onPress: (dateKey: string) => void;
}

export default function CalendarDayCell({
  day,
  isSelected,
  onPress,
}: CalendarDayCellProps) {
  const isPaddingCell = !day.isCurrentMonth;
  const hasMemo = day.hasMemo && !isPaddingCell;
  const amountLabel =
    typeof day.amount === 'number' && day.amount > 0
      ? day.amount.toLocaleString()
      : day.isFuture
        ? ''
        : '-';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={isPaddingCell}
      style={[
        styles.dayCell,
        isPaddingCell && styles.dayCellPadding,
        isSelected && styles.dayCellSelected,
        day.isFuture && styles.dayCellFuture,
      ]}
      onPress={() => onPress(day.dateKey)}
    >
      {hasMemo ? (
        <View style={[styles.memoBadge, isSelected && styles.memoBadgeSelected]}>
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
        {amountLabel}
      </Text>

      {day.isToday && !isSelected ? <View style={styles.todayRing} /> : null}
    </TouchableOpacity>
  );
}
