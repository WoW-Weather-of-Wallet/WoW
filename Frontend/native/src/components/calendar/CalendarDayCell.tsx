import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WEATHER_ICONS } from '../../constants/calendar/ui';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
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
  const isToday = day.isToday && !isSelected;
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
      className="items-center justify-start"
      style={{
        width: '14.28%',
        minHeight: hp(58),
        borderRadius: RADIUS.lg,
        paddingVertical: hp(4),
        paddingTop: hp(2),
        position: 'relative',
        opacity: isPaddingCell ? 0 : day.isFuture ? 0.72 : 1,
        backgroundColor: isSelected ? COLORS.primary : 'transparent',
        shadowColor: isSelected ? COLORS.primary : 'transparent',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isSelected ? 0.18 : 0,
        shadowRadius: isSelected ? 8 : 0,
        elevation: isSelected ? 2 : 0,
      }}
      onPress={() => onPress(day.dateKey)}
    >
      {hasMemo ? (
        <View
          style={{
            position: 'absolute',
            top: hp(2.9),
            right: wp(2.8),
            zIndex: 2,
            opacity: isSelected ? 0.92 : 1,
          }}
        >
          <MemoIcon size={11} />
        </View>
      ) : null}

      <View
        style={{
          marginBottom: hp(2),
        }}
      >
        <View
          style={{
            minWidth: wp(30),
            height: wp(30),
            paddingHorizontal: wp(6),
            borderRadius: wp(15),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isToday ? COLORS.primary50 : 'transparent',
            borderWidth: isToday ? 1 : 0,
            borderColor: isToday ? COLORS.todayRingBorder : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.bold,
              color: isPaddingCell
                ? 'transparent'
                : isSelected
                  ? COLORS.textInverse
                  : isToday
                    ? COLORS.primaryDark
                    : COLORS.textPrimary,
            }}
          >
            {day.dayNumber}
          </Text>
        </View>
      </View>

      <View
        className="items-center justify-center"
        style={{ minHeight: hp(14), opacity: isPaddingCell ? 0 : 1 }}
      >
        {day.weatherTone ? (
          <Ionicons
            name={WEATHER_ICONS[day.weatherTone]}
            size={wp(13)}
            color={isSelected ? COLORS.textInverse : COLORS.primary}
          />
        ) : null}
      </View>

      <Text
        style={{
          minHeight: fp(11),
          fontSize: fp(9),
          fontFamily: FONTS.medium,
          color: isPaddingCell
            ? 'transparent'
            : isSelected
              ? COLORS.white
              : COLORS.spentRed,
          marginTop: hp(3),
        }}
      >
        {amountLabel}
      </Text>
    </TouchableOpacity>
  );
}
