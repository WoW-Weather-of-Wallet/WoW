import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomSheetModal from '../common/BottomSheetModal';
import { WEEKDAY_LABELS } from '../../constants/calendar/ui';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { formatMonthLabel } from '../../constants/calendar/state';

interface CalendarDatePickerSheetProps {
  visible: boolean;
  initialDateKey: string;
  title?: string;
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
}

interface DatePickerCell {
  key: string;
  dateKey?: string;
  dayNumber?: number;
  isCurrentMonth: boolean;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day);

  if (!year || !month || !day || Number.isNaN(nextDate.getTime())) {
    return new Date();
  }

  return nextDate;
}

function buildDatePickerCells(displayedMonth: Date): DatePickerCell[] {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: DatePickerCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({
      key: `padding-${year}-${month}-${index}`,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    cells.push({
      key: dateKey,
      dateKey,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  return cells;
}

export default function CalendarDatePickerSheet({
  visible,
  initialDateKey,
  title = '날짜 선택',
  onClose,
  onSelectDate,
}: CalendarDatePickerSheetProps) {
  const initialDate = React.useMemo(() => parseDateKey(initialDateKey), [initialDateKey]);
  const [displayedMonth, setDisplayedMonth] = React.useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [selectedDateKey, setSelectedDateKey] = React.useState(initialDateKey);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const nextInitialDate = parseDateKey(initialDateKey);
    setDisplayedMonth(new Date(nextInitialDate.getFullYear(), nextInitialDate.getMonth(), 1));
    setSelectedDateKey(initialDateKey);
  }, [initialDateKey, visible]);

  const today = React.useMemo(() => new Date(), []);
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dateCells = React.useMemo(() => buildDatePickerCells(displayedMonth), [displayedMonth]);

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={title}
      scrollable={false}
      showCloseButton={false}
    >
      <View style={{ gap: hp(16) }}>
        <View className="flex-row items-center justify-between" style={{ gap: wp(12) }}>
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              width: wp(34),
              height: wp(34),
              borderRadius: wp(17),
              backgroundColor: COLORS.backgroundSecondary,
            }}
            onPress={() => {
              setDisplayedMonth((current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1),
              );
            }}
          >
            <Ionicons name="chevron-back" size={wp(18)} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
            }}
          >
            {formatMonthLabel(displayedMonth)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              width: wp(34),
              height: wp(34),
              borderRadius: wp(17),
              backgroundColor: COLORS.backgroundSecondary,
            }}
            onPress={() => {
              setDisplayedMonth((current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1),
              );
            }}
          >
            <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: hp(8) }}>
          <View className="flex-row justify-between">
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

          <View className="flex-row flex-wrap" style={{ rowGap: hp(6) }}>
            {dateCells.map((cell) => {
              const isSelected = cell.dateKey === selectedDateKey;
              const isToday = cell.dateKey === todayDateKey && !isSelected;

              return (
                <View key={cell.key} style={{ width: '14.28%', alignItems: 'center' }}>
                  {cell.isCurrentMonth && cell.dateKey ? (
                    <TouchableOpacity
                      activeOpacity={0.86}
                      className="items-center justify-center"
                      style={{
                        width: wp(34),
                        height: wp(34),
                        borderRadius: wp(17),
                        backgroundColor: isSelected ? COLORS.primary : isToday ? COLORS.primary50 : 'transparent',
                        borderWidth: isToday ? 1 : 0,
                        borderColor: isToday ? COLORS.todayRingBorder : 'transparent',
                      }}
                      onPress={() => {
                        setSelectedDateKey(cell.dateKey as string);
                        onSelectDate(cell.dateKey as string);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: fp(14),
                          fontFamily: FONTS.bold,
                          color: isSelected
                            ? COLORS.textInverse
                            : isToday
                              ? COLORS.primaryDark
                              : COLORS.textPrimary,
                        }}
                      >
                        {cell.dayNumber}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        width: wp(34),
                        height: wp(34),
                        borderRadius: wp(17),
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}
