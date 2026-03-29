import React from 'react';
import { View } from 'react-native';
import {
  Calendar,
  LocaleConfig,
  type DateData,
} from 'react-native-calendars';

import BottomSheetModal from '../common/BottomSheetModal';
import { COLORS, FONTS, RADIUS, fp } from '../../constants/theme';

interface CalendarDatePickerSheetProps {
  visible: boolean;
  initialDateKey: string;
  title?: string;
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
}

if (!LocaleConfig.locales.kr) {
  LocaleConfig.locales.kr = {
    monthNames: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    monthNamesShort: [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ],
    dayNames: [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘',
  };
}

LocaleConfig.defaultLocale = 'kr';

export default function CalendarDatePickerSheet({
  visible,
  initialDateKey,
  title = '날짜 선택',
  onClose,
  onSelectDate,
}: CalendarDatePickerSheetProps) {
  const today = React.useMemo(() => new Date(), []);
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const markedDates = React.useMemo(
    () => ({
      [todayDateKey]: {
        ...(todayDateKey === initialDateKey
          ? {}
          : {
              selected: true,
              selectedColor: COLORS.primary50,
              selectedTextColor: COLORS.primaryDark,
            }),
      },
      [initialDateKey]: {
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.white,
      },
    }),
    [initialDateKey, todayDateKey],
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={title}
      scrollable={false}
      showCloseButton={false}
    >
      <View
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.background,
          overflow: 'hidden',
        }}
      >
        <Calendar
          current={initialDateKey}
          firstDay={0}
          enableSwipeMonths
          hideExtraDays={false}
          markedDates={markedDates}
          monthFormat="yyyy년 M월"
          onDayPress={(date: DateData) => {
            onSelectDate(date.dateString);
          }}
          theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.background,
            textSectionTitleColor: COLORS.textTertiary,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: COLORS.white,
            todayTextColor: COLORS.primaryDark,
            dayTextColor: COLORS.textPrimary,
            textDisabledColor: COLORS.gray300,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.textPrimary,
            indicatorColor: COLORS.primary,
            textDayFontFamily: FONTS.medium,
            textMonthFontFamily: FONTS.bold,
            textDayHeaderFontFamily: FONTS.bold,
            textDayFontSize: fp(14),
            textMonthFontSize: fp(18),
            textDayHeaderFontSize: fp(11),
          }}
          style={{
            paddingBottom: 10,
          }}
          headerStyle={{
            marginBottom: 6,
            paddingHorizontal: 6,
          }}
        />
      </View>
    </BottomSheetModal>
  );
}
