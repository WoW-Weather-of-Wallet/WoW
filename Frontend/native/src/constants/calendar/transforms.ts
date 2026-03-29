import type {
  CalendarDayDetail,
  CalendarDayItem,
  CalendarTransactionGroup,
  FixedExpenseItem,
} from '../../mock/calendar';
import type {
  CalendarBackendDayType,
  CalendarConfirmRequest,
  CalendarDailyResponse,
  CalendarMonthlyResponse,
  CalendarTransactionsResponse,
  FixedExpenseManageResponse,
  FixedExpenseSummaryResponse,
  ManualCalendarEntryDraft,
} from '../../types/calendar';
import {
  CALENDAR_ENTRY_CATEGORIES,
  DEFAULT_CALENDAR_CATEGORY,
} from './addEntry';
import {
  type ManageFixedExpenseItem,
  CATEGORY_META,
} from './state';

const CATEGORY_ID_BY_KEY = buildCategoryIdMap();

export function buildSavingsLabel(savedAmount: number) {
  if (savedAmount > 0) {
    return `지난달보다 ${savedAmount.toLocaleString()}원 덜 썼어요`;
  }

  if (savedAmount < 0) {
    return `지난달보다 ${Math.abs(savedAmount).toLocaleString()}원 더 썼어요`;
  }

  return '지난달과 비슷한 소비 흐름이에요';
}

export function resolveWeatherIconName(iconCode?: string | null) {
  const normalizedCode = iconCode?.toLowerCase();

  if (!normalizedCode) {
    return 'partly-sunny' as const;
  }

  if (normalizedCode.includes('rain')) {
    return 'rainy' as const;
  }

  if (normalizedCode.includes('cloud')) {
    return 'cloudy' as const;
  }

  if (normalizedCode.includes('snow')) {
    return 'snow' as const;
  }

  if (normalizedCode.includes('sun') || normalizedCode.includes('clear')) {
    return 'sunny' as const;
  }

  return 'partly-sunny' as const;
}

export function buildCustomRequest(entries: ManualCalendarEntryDraft[]) {
  return {
    items: entries.map((entry) => ({
      merchantName: entry.merchantName,
      amount: entry.amount,
      categoryId: entry.categoryId ?? resolveCategoryId(entry.category),
      transactionDate: entry.dateKey,
    })),
  };
}

export function buildConfirmRequests(entries: ManualCalendarEntryDraft[]): CalendarConfirmRequest[] {
  const groupedEntries = new Map<string, ManualCalendarEntryDraft[]>();

  entries.forEach((entry) => {
    groupedEntries.set(entry.dateKey, [...(groupedEntries.get(entry.dateKey) ?? []), entry]);
  });

  return Array.from(groupedEntries.entries()).map(([dateKey, groupedDateEntries]) => ({
    items: groupedDateEntries.map((entry) => ({
      merchantName: entry.merchantName,
      amount: entry.amount,
      categoryId: entry.categoryId ?? resolveCategoryId(entry.category),
      transactionDate: dateKey,
    })),
  }));
}

export function mapMonthlyResponseToCalendarDays(monthlyResponse: CalendarMonthlyResponse[]) {
  return monthlyResponse
    .map((item) => mapMonthlyResponseToCalendarDay(item))
    .sort((left, right) => (left.dateKey > right.dateKey ? 1 : -1));
}

export function mapDailyResponseToDetail(response: CalendarDailyResponse): CalendarDayDetail {
  const weatherLabel = response.weather.weatherName || '정보 없음';
  const weatherHint = response.weather.description || '날씨 정보가 없습니다.';
  const derivedSpentAmount = calculateDailySpentAmount(response);
  const derivedTransactionCount = calculateDailyTransactionCount(response);

  return {
    dateKey: response.date,
    title: formatMonthDayTitle(response.date),
    weatherLabel,
    weatherHint,
    weatherIconCode: response.weather.iconCode,
    weatherTemperature: response.weather.isForecast === 1 ? '예측' : '실측',
    spentAmount: derivedSpentAmount,
    transactionCount: derivedTransactionCount,
    memo: response.memo ?? '',
    items: response.transactions.map((transaction, index) =>
      mapDailyTransactionItem(response.date, transaction, index),
    ),
  };
}

export function mapCalendarTransactionsResponse(
  response: CalendarTransactionsResponse,
): CalendarTransactionGroup[] {
  return response.items
    .map((dailyItem) => ({
      id: dailyItem.date,
      dateLabel: formatMonthDayTitle(dailyItem.date),
      dailySpent: dailyItem.transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      items: dailyItem.transactions.map((transaction, index) => {
        const fallbackCategory = transaction.category ?? DEFAULT_CALENDAR_CATEGORY;
        const categoryMeta =
          CATEGORY_META[fallbackCategory] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];

        return {
          id: `${dailyItem.date}-history-${transaction.transactionId ?? index}`,
          backendTransactionId: transaction.transactionId,
          title: transaction.merchantName,
          category: fallbackCategory,
          amount: transaction.amount,
          icon: transaction.icon ?? categoryMeta.icon,
          iconTone: categoryMeta.iconTone,
          isFixedExpense: transaction.isFixed,
        };
      }),
    }))
    .sort((left, right) => (left.id < right.id ? 1 : -1));
}

export function removeTransactionFromGroups(
  groups: CalendarTransactionGroup[],
  transactionId: number,
) {
  return groups
    .map((group) => {
      const nextItems = group.items.filter(
        (item) => item.backendTransactionId !== transactionId,
      );

      if (nextItems.length === group.items.length) {
        return group;
      }

      return {
        ...group,
        dailySpent: nextItems.reduce((sum, item) => sum + item.amount, 0),
        items: nextItems,
      };
    })
    .filter((group) => group.items.length > 0);
}

export function removeTransactionFromDayDetails(
  details: Record<string, CalendarDayDetail>,
  dateKey: string,
  transactionId: number,
) {
  const targetDetail = details[dateKey];
  if (!targetDetail) {
    return details;
  }

  const nextItems = targetDetail.items.filter(
    (item) => item.backendTransactionId !== transactionId,
  );

  return {
    ...details,
    [dateKey]: {
      ...targetDetail,
      spentAmount:
        nextItems.length > 0 ? nextItems.reduce((sum, item) => sum + item.amount, 0) : null,
      transactionCount: nextItems.length > 0 ? nextItems.length : null,
      items: nextItems,
    },
  };
}

export function removeTransactionFromDaySource(
  days: CalendarDayItem[],
  dateKey: string,
  removedAmount: number,
) {
  return days.map((day) => {
    if (day.dateKey !== dateKey) {
      return day;
    }

    const nextAmount = Math.max((day.amount ?? 0) - removedAmount, 0);

    return {
      ...day,
      amount: nextAmount > 0 ? nextAmount : undefined,
    };
  });
}

export function replaceMonthCalendarDaySource(
  current: CalendarDayItem[],
  displayedMonth: Date,
  nextDays: CalendarDayItem[],
) {
  const monthPrefix = getMonthPrefix(displayedMonth);
  return [...current.filter((day) => !day.dateKey.startsWith(monthPrefix)), ...nextDays];
}

export function replaceMonthTransactionGroups(
  current: CalendarTransactionGroup[],
  displayedMonth: Date,
  nextGroups: CalendarTransactionGroup[],
) {
  const monthPrefix = getMonthPrefix(displayedMonth);
  return [...current.filter((group) => !group.id.startsWith(monthPrefix)), ...nextGroups].sort((a, b) =>
    a.id < b.id ? 1 : -1,
  );
}

export function mapFixedExpenseSummaryItems(response: FixedExpenseSummaryResponse): FixedExpenseItem[] {
  const grouped = response.items.reduce<Map<string, FixedExpenseSummaryResponse['items']>>((acc, item) => {
    const category = item.categoryName ?? DEFAULT_CALENDAR_CATEGORY;
    acc.set(category, [...(acc.get(category) ?? []), item]);
    return acc;
  }, new Map());

  return Array.from(grouped.entries()).map(([category, items], index) => {
    const categoryMeta = CATEGORY_META[category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];
    const amount = items.reduce((sum, item) => sum + item.amount, 0);
    const statusLabel = items.some((item) => item.paymentStatus.includes('완료'))
      ? '납부완료'
      : items[0]?.paymentStatus ?? '';

    return {
      id: `fixed-expense-summary-${index}`,
      title: category,
      subtitle: `${items.length}건`,
      amount,
      statusLabel,
      statusTone: resolveFixedExpenseStatusTone(statusLabel),
      icon: categoryMeta.icon,
      iconTone: categoryMeta.iconTone,
      countLabel: `${items.length}건`,
      isExpanded: false,
      isEnabled: true,
    };
  });
}

export function mapFixedExpenseManageItems(response: FixedExpenseManageResponse): ManageFixedExpenseItem[] {
  return response.items.map((item) => {
    const category = item.categoryName ?? DEFAULT_CALENDAR_CATEGORY;
    const categoryMeta = CATEGORY_META[category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];

    return {
      id: `fixed-expense-${item.id}`,
      fixedExpenseId: item.id,
      title: item.name,
      subtitle: `매월 ${item.dueDay}일 · ${category}`,
      amount: item.amount,
      icon: categoryMeta.icon,
      iconTone: categoryMeta.iconTone,
      isEnabled: item.isEnable ?? true,
      category,
      paymentStatus: item.paymentStatus,
      paymentDay: item.dueDay,
    };
  });
}

function buildCategoryIdMap() {
  return CALENDAR_ENTRY_CATEGORIES.reduce<Record<string, number>>((acc, category, index) => {
    acc[category.key] = index + 1;
    return acc;
  }, {});
}

function resolveCategoryId(category: string) {
  const categoryId = CATEGORY_ID_BY_KEY[category];

  if (!categoryId) {
    throw new Error(`카테고리 ID를 찾을 수 없어요: ${String(category)}`);
  }

  return categoryId;
}

function mapMonthlyResponseToCalendarDay(
  item: CalendarMonthlyResponse,
): CalendarDayItem {
  const [, , dayRaw] = item.date.split('-').map(Number);
  const isFuture = item.dayType === 'NEAR_FUTURE' || item.dayType === 'FAR_FUTURE';

  return {
    dateKey: item.date,
    dayNumber: dayRaw,
    amount: item.dailyTotal ?? undefined,
    tone: resolveCalendarTone(item.dayType, item.dailyTotal),
    weatherTone: resolveWeatherTone(item.iconCode),
    isCurrentMonth: true,
    isToday: item.dayType === 'TODAY',
    isFuture,
  };
}

function mapDailyTransactionItem(
  dateKey: string,
  transaction: CalendarDailyResponse['transactions'][number],
  index: number,
): CalendarTransactionGroup['items'][number] {
  const categoryMeta = CATEGORY_META[transaction.category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];

  return {
    id: `${dateKey}-detail-${index}`,
    title: transaction.merchantName,
    category: transaction.category,
    amount: transaction.amount,
    icon: transaction.categoryIcon ?? categoryMeta.icon,
    iconTone: categoryMeta.iconTone,
  };
}

function resolveCalendarTone(dayType: CalendarBackendDayType, dailyTotal: number | null) {
  if (dayType === 'TODAY') {
    return 'primary' as const;
  }

  if ((dailyTotal ?? 0) >= 100000) {
    return 'rose' as const;
  }

  if ((dailyTotal ?? 0) >= 50000) {
    return 'gold' as const;
  }

  return 'mint' as const;
}

function resolveWeatherTone(iconCode: string | null | undefined) {
  const normalizedCode = iconCode?.toLowerCase();

  if (!normalizedCode) {
    return undefined;
  }

  if (normalizedCode.includes('rain')) {
    return 'rainy' as const;
  }

  if (normalizedCode.includes('cloud')) {
    return 'cloudy' as const;
  }

  if (normalizedCode.includes('sun')) {
    return 'sunny' as const;
  }

  if (normalizedCode.includes('clear')) {
    return 'clear' as const;
  }

  return 'cloudy' as const;
}

function calculateDailySpentAmount(response: CalendarDailyResponse) {
  if (response.summary.totalExpense !== null) {
    return response.summary.totalExpense;
  }

  if (response.transactions.length === 0) {
    return null;
  }

  return response.transactions.reduce((sum, transaction) => sum + Math.max(transaction.amount, 0), 0);
}

function calculateDailyTransactionCount(response: CalendarDailyResponse) {
  if (response.summary.transactionCount !== null) {
    return response.summary.transactionCount;
  }

  return response.transactions.length > 0 ? response.transactions.length : null;
}

function getMonthPrefix(displayedMonth: Date) {
  return `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthDayTitle(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function resolveFixedExpenseStatusTone(paymentStatus: string): FixedExpenseItem['statusTone'] {
  if (paymentStatus.includes('완료')) {
    return 'done';
  }

  if (paymentStatus.startsWith('D-')) {
    return 'countdown';
  }

  return 'pending';
}
