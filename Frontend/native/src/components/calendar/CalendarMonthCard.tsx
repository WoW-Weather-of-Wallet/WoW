import React from 'react';
import { Text, View } from 'react-native';
import SurfaceCard from '../common/SurfaceCard';
import { WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, FONTS, fp, hp } from '../../constants/theme';
import type { CalendarDayItem } from '../../mock/calendar';
import CalendarDayCell from './CalendarDayCell';

interface CalendarMonthCardProps {
  days: CalendarDayItem[];
  selectedDateKey?: string | null;
  onSelectDate: (dateKey: string) => void;
}

export default function CalendarMonthCard({
  days,
  selectedDateKey,
  onSelectDate,
}: CalendarMonthCardProps) {
  return (
    <SurfaceCard style={{ paddingHorizontal: hp(14), paddingVertical: hp(14), gap: hp(4) }}>
      <View
        className="flex-row justify-between"
        style={{ marginBottom: 0 }}
      >
        {WEEKDAY_LABELS.map((label, index) => (
          <Text
            key={label}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: fp(10),
              fontFamily: FONTS.bold,
              color:
                index === 0
                  ? COLORS.sundayRed
                  : index === 6
                    ? COLORS.primary
                    : COLORS.textTertiary,
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      <View
        className="flex-row flex-wrap"
        style={{ rowGap: hp(1), marginTop: -hp(5) }}
      >
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
