import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { type CalendarDayItem, type CalendarWeatherTone } from '../../mock/calendar';
import { COLORS, hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
import {
  HomeBudgetReportCard,
  HomeCategorySection,
  HomeInsightSection,
  HomeMonthlyReportSheet,
  HomeScheduleSection,
  HomeSpendingTypeCard,
  HomeSpendingTypeSheet,
  HomeTodayWeatherCard,
  HomeWeeklyPreviewCard,
} from '../../components/main';
import { getCalendarHeader, getCalendarMonthly } from '../../services/calendar';
import { useAuthStore } from '../../store/authStore';
import type {
  CalendarBackendDayType,
  CalendarHeaderResponse,
  CalendarMonthlyResponse,
} from '../../types/calendar';

export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((state) => state.accessToken);
  const tabBarHeight = useBottomTabBarHeight();
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [weeklyPreviewItems, setWeeklyPreviewItems] = React.useState<CalendarDayItem[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const monthLabel = `${today.getMonth() + 1}월`;

  const loadHomeCalendarData = React.useCallback(async () => {
    if (!accessToken) {
      setLiveHeader(null);
      setWeeklyPreviewItems([]);
      setIsWeatherLoading(false);
      return;
    }

    const weekDates = buildWeekDates(today);
    const monthParams = buildMonthParams(weekDates);

    setIsWeatherLoading(true);

    try {
      const [headerResponse, monthlyResponses] = await Promise.all([
        getCalendarHeader({
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        }),
        Promise.all(
          monthParams.map(async (params) => [
            toMonthKey(params.year, params.month),
            await getCalendarMonthly(params),
          ] as const),
        ),
      ]);

      const monthlyResponseByMonth = new Map(monthlyResponses);

      setLiveHeader(headerResponse);
      setWeeklyPreviewItems(
        weekDates.map((date) =>
          mapWeeklyPreviewDay(
            date,
            monthlyResponseByMonth.get(toMonthKey(date.getFullYear(), date.getMonth() + 1)) ?? [],
            today,
          ),
        ),
      );
    } catch (error) {
      console.warn('Failed to load home calendar preview from backend', error);
      setLiveHeader(null);
      setWeeklyPreviewItems([]);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [accessToken, today]);

  useFocusEffect(
    React.useCallback(() => {
      void loadHomeCalendarData();
    }, [loadHomeCalendarData]),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: tabBarHeight + hp(30),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeTodayWeatherCard
          weatherName={liveHeader?.weatherName}
          description={liveHeader?.description}
          iconCode={liveHeader?.iconCode}
          isLoading={isWeatherLoading}
        />
        <HomeSpendingTypeCard onPress={spendingTypeModal.open} />
        <HomeWeeklyPreviewCard items={weeklyPreviewItems} />
        <HomeBudgetReportCard
          monthLabel={monthLabel}
          userName="-"
          remainingBudget={null}
          budgetUsageRate={null}
          spentAmount={null}
          totalBudget={null}
          forecastText="-"
          onPress={reportModal.open}
        />
        <HomeInsightSection items={[]} />
        <HomeCategorySection items={[]} />
        <HomeScheduleSection items={[]} />
      </ScrollView>

      <HomeSpendingTypeSheet visible={spendingTypeModal.visible} onClose={spendingTypeModal.close} />
      <HomeMonthlyReportSheet visible={reportModal.visible} onClose={reportModal.close} />
    </View>
  );
}

function buildWeekDates(baseDate: Date) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + index);
    return nextDate;
  });
}

function buildMonthParams(dates: Date[]) {
  const monthKeySet = new Set<string>();

  return dates.flatMap((date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = toMonthKey(year, month);

    if (monthKeySet.has(key)) {
      return [];
    }

    monthKeySet.add(key);
    return [{ year, month }];
  });
}

function toMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function mapWeeklyPreviewDay(
  date: Date,
  monthlyItems: CalendarMonthlyResponse[],
  today: Date,
): CalendarDayItem {
  const dateKey = toDateKey(date);
  const monthlyItem = monthlyItems.find((item) => item.date === dateKey);
  const amount = monthlyItem?.dailyTotal ?? undefined;

  return {
    dateKey,
    dayNumber: date.getDate(),
    amount,
    tone: resolveCalendarTone(monthlyItem?.dayType, monthlyItem?.dailyTotal ?? null),
    weatherTone: resolveWeatherTone(monthlyItem?.iconCode),
    isCurrentMonth: true,
    isToday: isSameDate(date, today),
    isFuture: isAfterDate(date, today),
  };
}

function resolveCalendarTone(
  dayType: CalendarBackendDayType | undefined,
  dailyTotal: number | null,
): CalendarDayItem['tone'] {
  if (dayType === 'TODAY') {
    return 'primary';
  }

  if ((dailyTotal ?? 0) >= 100000) {
    return 'rose';
  }

  if ((dailyTotal ?? 0) >= 50000) {
    return 'gold';
  }

  return 'mint';
}

function resolveWeatherTone(iconCode: string | null | undefined): CalendarWeatherTone | undefined {
  const normalizedCode = iconCode?.toLowerCase();

  if (!normalizedCode) {
    return undefined;
  }

  if (normalizedCode.includes('rain')) {
    return 'rainy';
  }

  if (normalizedCode.includes('cloud')) {
    return 'cloudy';
  }

  if (normalizedCode.includes('sun')) {
    return 'sunny';
  }

  if (normalizedCode.includes('clear')) {
    return 'clear';
  }

  return 'cloudy';
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isAfterDate(left: Date, right: Date) {
  return new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime() >
    new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime();
}
