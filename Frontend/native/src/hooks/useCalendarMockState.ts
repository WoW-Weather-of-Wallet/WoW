import { useEffect, useMemo, useState } from 'react';
import {
  mockCalendarDayDetails,
  mockCalendarDays,
  mockCalendarTransactions,
  mockFixedExpenses,
  mockManageFixedExpenses,
  mockSelectableTransactions,
  type CalendarDayDetail,
  type CalendarDayItem,
  type CalendarTransactionGroup,
  type FixedExpenseItem,
} from '../mock/calendar';
import type {
  CalendarBackendDayType,
  CalendarConfirmRequest,
  CalendarDailyResponse,
  CalendarHeaderFetchState,
  CalendarHeaderResponse,
  ManualCalendarEntryDraft,
  CalendarMonthlyResponse,
} from '../types/calendar';
import {
  buildMonthDays,
  buildFallbackDetail,
  createDisplayedMonth,
  extractCategoryFromSubtitle,
  formatMonthLabel,
  type ManageFixedExpenseItem,
  CATEGORY_META,
} from '../constants/calendar/state';
import {
  buildManualEntryPatch,
  mergeCalendarDayDetails,
  mergeCalendarDaySource,
  mergeTransactionGroups,
} from '../constants/calendar/mutations';
import {
  CALENDAR_ENTRY_CATEGORIES,
  DEFAULT_CALENDAR_CATEGORY,
  type CalendarEntryCategoryKey,
} from '../constants/calendar/addEntry';
import {
  confirmCalendarTransactions,
  createCustomCalendarTransactions,
  getCalendarDaily,
  getCalendarHeader,
  getCalendarMonthly,
} from '../services/calendar';
import { useAuthStore } from '../store/authStore';

type CalendarTab = 'calendar' | 'history';

const BASE_OVERVIEW = {
  title: '이번 달',
  weatherTitle: '소비 날씨',
  weatherHint: '이번 달 소비 흐름을 확인해보세요.',
  savingsAmount: 101000,
  goalLabel: '이번 달 절약 금액',
};

const CATEGORY_ID_BY_KEY = buildCategoryIdMap();

export function useCalendarMockState() {
  // We anchor the screen to the real current date so the backend header can
  // be shown immediately on first open. Detailed body data still falls back to mock data.
  const today = useMemo(() => new Date(), []);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [displayedMonthOffset, setDisplayedMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState('');
  const [calendarDaySource, setCalendarDaySource] = useState<CalendarDayItem[]>(mockCalendarDays);
  const [calendarDayDetails, setCalendarDayDetails] =
    useState<Record<string, CalendarDayDetail>>(mockCalendarDayDetails);
  const [fixedExpenseItems, setFixedExpenseItems] = useState<FixedExpenseItem[]>(mockFixedExpenses);
  const [manageItems, setManageItems] = useState<ManageFixedExpenseItem[]>(
    mockManageFixedExpenses.map((item) => ({
      ...item,
      category: extractCategoryFromSubtitle(item.subtitle),
    })),
  );
  const [transactionGroups, setTransactionGroups] =
    useState<CalendarTransactionGroup[]>(mockCalendarTransactions);
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [isAddEntryVisible, setIsAddEntryVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>('pick-3');
  const [editingManageId, setEditingManageId] = useState<string | null>(null);
  const [headerFetchState, setHeaderFetchState] = useState<CalendarHeaderFetchState>('idle');
  const [headerErrorMessage, setHeaderErrorMessage] = useState<string | null>(null);
  const [liveHeader, setLiveHeader] = useState<CalendarHeaderResponse | null>(null);

  const sourceDaysByKey = useMemo(
    () => new Map(calendarDaySource.map((day) => [day.dateKey, day])),
    [calendarDaySource],
  );
  const memoDateKeys = useMemo(
    () =>
      new Set(
        Object.values(calendarDayDetails)
          .filter((detail) => detail.memo.trim().length > 0)
          .map((detail) => detail.dateKey),
      ),
    [calendarDayDetails],
  );
  const displayedMonth = useMemo(
    () => createDisplayedMonth(displayedMonthOffset),
    [displayedMonthOffset],
  );
  const monthLabel = useMemo(() => formatMonthLabel(displayedMonth), [displayedMonth]);
  const calendarDays = useMemo(
    () => buildMonthDays(displayedMonth, today, sourceDaysByKey, memoDateKeys),
    [displayedMonth, memoDateKeys, sourceDaysByKey, today],
  );
  const historyMonthKey = useMemo(
    () =>
      `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}`,
    [displayedMonth],
  );

  const overview = useMemo(() => {
    const savedAmount = liveHeader?.savedAmount ?? BASE_OVERVIEW.savingsAmount;

    return {
      ...BASE_OVERVIEW,
      monthLabel,
      weatherTitle: liveHeader?.weatherName ?? BASE_OVERVIEW.weatherTitle,
      weatherSubtitle: monthLabel,
      weatherHint: liveHeader?.description ?? BASE_OVERVIEW.weatherHint,
      savingsAmount: savedAmount,
      goalLabel: liveHeader ? buildSavingsLabel(savedAmount) : BASE_OVERVIEW.goalLabel,
    };
  }, [liveHeader, monthLabel]);

  useEffect(() => {
    const currentMonth = new Date();
    const currentMonthKey = currentMonth.getFullYear() * 12 + currentMonth.getMonth();
    const displayedMonthKey = displayedMonth.getFullYear() * 12 + displayedMonth.getMonth();
    const monthDiff = currentMonthKey - displayedMonthKey;

    // The backend currently calculates savings only for the current or previous month.
    // Older mock months stay visible so the calendar screen still has usable content.
    if (!accessToken || (monthDiff !== 0 && monthDiff !== 1)) {
      setLiveHeader(null);
      setHeaderFetchState('fallback');
      setHeaderErrorMessage(null);
      return;
    }

    let isCancelled = false;

    setHeaderFetchState('loading');
    setHeaderErrorMessage(null);

    getCalendarHeader({
      year: displayedMonth.getFullYear(),
      month: displayedMonth.getMonth() + 1,
    })
      .then((response) => {
        if (isCancelled) {
          return;
        }

        setLiveHeader(response);
        setHeaderFetchState('live');
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.warn('Failed to load calendar header from backend', error);
        setLiveHeader(null);
        setHeaderFetchState('fallback');
        setHeaderErrorMessage('캘린더 헤더를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, displayedMonth]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isCancelled = false;

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth() + 1;

    getCalendarMonthly({ year, month })
      .then(async (monthlyResponse) => {
        if (isCancelled) {
          return;
        }

        const nextCalendarDaySource = monthlyResponse.map((item) =>
          mapMonthlyResponseToCalendarDay(item),
        );
        setCalendarDaySource((current) =>
          replaceMonthCalendarDaySource(current, displayedMonth, nextCalendarDaySource),
        );

        const monthDateKeys = buildMonthDateKeys(displayedMonth);
        const dailyResponses = await Promise.all(
          monthDateKeys.map(async (dateKey) => {
            try {
              return await getCalendarDaily({ date: dateKey });
            } catch (error) {
              console.warn('Failed to load calendar daily detail', dateKey, error);
              return null;
            }
          }),
        );

        if (isCancelled) {
          return;
        }

        const monthDetails: Record<string, CalendarDayDetail> = {};
        const monthGroups: CalendarTransactionGroup[] = [];

        dailyResponses.forEach((dailyResponse) => {
          if (!dailyResponse) {
            return;
          }

          const mappedDetail = mapDailyResponseToDetail(dailyResponse);
          monthDetails[mappedDetail.dateKey] = mappedDetail;

          const mappedGroup = mapDailyResponseToTransactionGroup(dailyResponse);
          if (mappedGroup) {
            monthGroups.push(mappedGroup);
          }
        });

        setCalendarDayDetails((current) =>
          replaceMonthCalendarDayDetails(current, displayedMonth, monthDetails),
        );
        setTransactionGroups((current) =>
          replaceMonthTransactionGroups(current, displayedMonth, monthGroups),
        );
      })
      .catch((error) => {
        console.warn('Failed to load calendar month from backend', error);
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, displayedMonth]);

  useEffect(() => {
    setSelectedDateKey(null);
  }, [displayedMonthOffset]);

  const selectedDetail = useMemo(() => {
    if (!selectedDateKey) {
      return null;
    }

    return calendarDayDetails[selectedDateKey] ?? buildFallbackDetail(selectedDateKey);
  }, [calendarDayDetails, selectedDateKey]);

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    setMemoValue(selectedDetail.memo);
  }, [selectedDetail]);

  const selectedTransaction = useMemo(
    () => mockSelectableTransactions.find((item) => item.id === selectedTransactionId) ?? null,
    [selectedTransactionId],
  );
  const editingManageItem = useMemo(
    () => manageItems.find((item) => item.id === editingManageId) ?? null,
    [editingManageId, manageItems],
  );
  const fixedExpenseDetailsByCategory = useMemo(
    () =>
      manageItems.reduce<Record<string, ManageFixedExpenseItem[]>>((acc, item) => {
        const category = item.category ?? extractCategoryFromSubtitle(item.subtitle);
        acc[category] = [...(acc[category] ?? []), item];
        return acc;
      }, {}),
    [manageItems],
  );
  const filteredTransactionGroups = useMemo(
    () => transactionGroups.filter((group) => group.id.startsWith(historyMonthKey)),
    [historyMonthKey, transactionGroups],
  );
  const fixedExpensesTotal = useMemo(
    () => fixedExpenseItems.reduce((sum, item) => sum + item.amount, 0),
    [fixedExpenseItems],
  );
  const defaultAddEntryDateKey = useMemo(() => {
    if (selectedDateKey) {
      return selectedDateKey;
    }

    const lastDate = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + 1,
      0,
    ).getDate();
    const defaultDay = displayedMonthOffset === 0 ? Math.min(today.getDate(), lastDate) : 1;

    return `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;
  }, [displayedMonth, displayedMonthOffset, selectedDateKey, today]);

  function handleMoveMonth(direction: 'prev' | 'next') {
    setDisplayedMonthOffset((current) => current + (direction === 'next' ? 1 : -1));
  }

  function handleToggleFixedExpenseExpand(id: string) {
    // 요약 카드에서는 카테고리만 보이고,
    // 상세 카드는 클릭했을 때만 열리도록 확장 상태를 별도로 관리합니다.
    setFixedExpenseItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item)),
    );
  }

  function handleRegisterFixedExpense(payload: { category: string; paymentDay: number }) {
    if (!selectedTransaction) {
      return;
    }

    const fallbackCategoryMeta = Object.values(CATEGORY_META)[0];
    const categoryMeta = CATEGORY_META[payload.category] ?? fallbackCategoryMeta;

    setManageItems((current) => {
      const nextItem: ManageFixedExpenseItem = {
        id: editingManageId ?? `manage-${selectedTransaction.id}`,
        title: selectedTransaction.title,
        subtitle: `매월 ${payload.paymentDay}일 · ${payload.category}`,
        amount: selectedTransaction.amount,
        icon: selectedTransaction.icon,
        iconTone: selectedTransaction.iconTone,
        isEnabled: true,
        category: payload.category,
        sourceTransactionId: selectedTransaction.id,
        paymentDay: payload.paymentDay,
      };

      const withoutDuplicate = current.filter((item) => item.id !== nextItem.id);
      return [...withoutDuplicate, nextItem];
    });

    setFixedExpenseItems((current) => {
      const targetIndex = current.findIndex((item) => item.title === payload.category);
      if (targetIndex === -1) {
        return [
          ...current,
          {
            id: `fixed-${selectedTransaction.id}`,
            title: payload.category,
            subtitle: '1건',
            amount: selectedTransaction.amount,
            statusLabel: `D-${payload.paymentDay}`,
            statusTone: 'countdown',
            icon: categoryMeta.icon,
            iconTone: categoryMeta.iconTone,
            countLabel: '1건',
            isExpanded: true,
            isEnabled: true,
          },
        ];
      }

      return current.map((item, index) => {
        if (index !== targetIndex) {
          return item;
        }

        const currentCount = Number.parseInt(item.subtitle, 10) || 1;
        const nextCount = currentCount + 1;

        return {
          ...item,
          amount: item.amount + selectedTransaction.amount,
          subtitle: `${nextCount}건`,
          countLabel: `${nextCount}건`,
          statusLabel: `D-${payload.paymentDay}`,
          statusTone: 'countdown',
          isExpanded: true,
          isEnabled: true,
        };
      });
    });

    setTransactionGroups((current) =>
      current.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === selectedTransaction.id ? { ...item, isFixedExpense: true } : item,
        ),
      })),
    );

    setIsDetailSheetVisible(false);
    setEditingManageId(null);
    setIsManageModalVisible(true);
  }

  function handleToggleManageItem(id: string, nextValue: boolean) {
    setManageItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isEnabled: nextValue } : item)),
    );
  }

  function handleDeleteManageItem(id: string) {
    const target = manageItems.find((item) => item.id === id);
    if (!target) {
      return;
    }

    setManageItems((current) => current.filter((item) => item.id !== id));

    setFixedExpenseItems((current) =>
      current
        .map((item) => {
          if (item.title !== target.category) {
            return item;
          }

          const currentCount = Number.parseInt(item.subtitle, 10) || 1;
          const nextCount = Math.max(0, currentCount - 1);
          const nextAmount = Math.max(0, item.amount - target.amount);

          return {
            ...item,
            amount: nextAmount,
            subtitle: `${nextCount}건`,
            countLabel: `${nextCount}건`,
            isEnabled: nextCount > 0 ? item.isEnabled : false,
          };
        })
        .filter((item) => item.amount > 0 || item.id !== `fixed-${target.sourceTransactionId}`),
    );

    if (target.sourceTransactionId) {
      setTransactionGroups((current) =>
        current.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === target.sourceTransactionId ? { ...item, isFixedExpense: false } : item,
          ),
        })),
      );
    }
  }

  function handleEditManageItem(id: string) {
    const target = manageItems.find((item) => item.id === id);
    if (!target) {
      return;
    }

    setEditingManageId(id);
    if (target.sourceTransactionId) {
      setSelectedTransactionId(target.sourceTransactionId);
    }
    setIsManageModalVisible(false);
    setIsDetailSheetVisible(true);
  }

  async function handleSaveManualEntries(entries: ManualCalendarEntryDraft[]) {
    if (entries.length === 0) {
      return;
    }

    if (accessToken) {
      await createCustomCalendarTransactions(buildCustomRequest(entries));
    }

    const patch = buildManualEntryPatch(entries);
    setTransactionGroups((current) => mergeTransactionGroups(current, patch));
    setCalendarDaySource((current) => mergeCalendarDaySource(current, patch));
    setCalendarDayDetails((current) => mergeCalendarDayDetails(current, patch));
    setIsAddEntryVisible(false);
  }

  async function handleSaveExcelEntries(entries: ManualCalendarEntryDraft[]) {
    if (entries.length === 0) {
      return;
    }

    if (accessToken) {
      const requests = buildConfirmRequests(entries);

      for (const request of requests) {
        // The backend confirm API deletes and re-inserts one date at a time.
        // We therefore split requests by date and save them sequentially.
        await confirmCalendarTransactions(request);
      }
    }

    const patch = buildManualEntryPatch(entries);
    setTransactionGroups((current) => mergeTransactionGroups(current, patch));
    setCalendarDaySource((current) => mergeCalendarDaySource(current, patch));
    setCalendarDayDetails((current) => mergeCalendarDayDetails(current, patch));
    setIsAddEntryVisible(false);
  }

  function handleSaveMemo() {
    if (!selectedDateKey) {
      return;
    }

    const nextMemo = memoValue.trim();

    // 메모 저장 API는 아직 연결하지 않았습니다.
    // 캘린더 셀 표시(UI 비교)만 먼저 확인하기 위해 현재는 로컬 상태에만 반영합니다.
    // TODO: 백엔드 메모 API가 준비되면 여기서 서버 저장을 연결합니다.
    setCalendarDayDetails((current) => {
      const currentDetail = current[selectedDateKey] ?? buildFallbackDetail(selectedDateKey);

      return {
        ...current,
        [selectedDateKey]: {
          ...currentDetail,
          memo: nextMemo,
        },
      };
    });

    // API가 아직 없어서 저장 결과를 서버에서 재조회할 수 없으므로,
    // 로컬 반영 직후 시트를 닫아 캘린더 셀 아이콘 변화를 바로 확인할 수 있게 둡니다.
    setSelectedDateKey(null);
  }

  return {
    overview,
    monthLabel,
    calendarDays,
    activeTab,
    selectedDateKey,
    memoValue,
    fixedExpenseItems,
    fixedExpenseDetailsByCategory,
    manageItems,
    transactionGroups: filteredTransactionGroups,
    isManageModalVisible,
    isPickerVisible,
    isDetailSheetVisible,
    isAddEntryVisible,
    defaultAddEntryDateKey,
    selectedTransactionId,
    selectedDetail,
    selectedTransaction,
    editingManageItem,
    fixedExpensesTotal,
    headerFetchState,
    headerErrorMessage,
    weatherIconName: resolveWeatherIconName(liveHeader?.iconCode),
    historyTitle: monthLabel,
    emptyHistoryTitle: `${monthLabel} 거래 내역이 없어요`,
    emptyHistoryDescription: `${monthLabel}에 등록된 소비 내역이 아직 없어요.`,
    handleMoveMonth,
    handleToggleFixedExpenseExpand,
    setActiveTab,
    setSelectedDateKey,
    setMemoValue,
    setIsManageModalVisible,
    setIsPickerVisible,
    setIsDetailSheetVisible,
    setIsAddEntryVisible,
    setSelectedTransactionId,
    setEditingManageId,
    handleRegisterFixedExpense,
    handleToggleManageItem,
    handleDeleteManageItem,
    handleEditManageItem,
    handleSaveManualEntries,
    handleSaveExcelEntries,
    handleSaveMemo,
  };
}

function buildSavingsLabel(savedAmount: number) {
  if (savedAmount > 0) {
    return `지난달보다 ${savedAmount.toLocaleString()}원 덜 썼어요`;
  }

  if (savedAmount < 0) {
    return `지난달보다 ${Math.abs(savedAmount).toLocaleString()}원 더 썼어요`;
  }

  return '지난달과 비슷한 소비 흐름이에요';
}

function resolveWeatherIconName(iconCode?: string | null) {
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

function buildCategoryIdMap() {
  return CALENDAR_ENTRY_CATEGORIES.reduce<Record<string, number>>((acc, category, index) => {
    acc[category.key] = index + 1;
    return acc;
  }, {});
}

function buildCustomRequest(entries: ManualCalendarEntryDraft[]) {
  return {
    items: entries.map((entry) => ({
      merchantName: entry.merchantName,
      amount: entry.amount,
      categoryId: entry.categoryId ?? resolveCategoryId(entry.category),
      transactionDate: entry.dateKey,
    })),
  };
}

function buildConfirmRequests(entries: ManualCalendarEntryDraft[]): CalendarConfirmRequest[] {
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

function mapDailyResponseToDetail(response: CalendarDailyResponse): CalendarDayDetail {
  const weatherLabel = response.weather.weatherName || '정보 없음';
  const weatherHint = response.weather.description || '날씨 정보가 없습니다.';

  return {
    dateKey: response.date,
    title: formatMonthDayTitle(response.date),
    weatherLabel,
    weatherHint,
    weatherTemperature: response.weather.isForecast === 1 ? '예측' : '실측',
    spentAmount: response.summary.totalExpense,
    transactionCount: response.summary.transactionCount,
    memo: response.memo ?? '',
    items: response.transactions.map((transaction, index) =>
      mapDailyTransactionItem(response.date, transaction, index),
    ),
  };
}

function mapDailyResponseToTransactionGroup(response: CalendarDailyResponse): CalendarTransactionGroup | null {
  if (response.transactions.length === 0) {
    return null;
  }

  return {
    id: response.date,
    dateLabel: formatMonthDayTitle(response.date),
    dailySpent: response.summary.totalExpense ?? 0,
    items: response.transactions.map((transaction, index) =>
      mapDailyTransactionItem(response.date, transaction, index),
    ),
  };
}

function mapDailyTransactionItem(
  dateKey: string,
  transaction: CalendarDailyResponse['transactions'][number],
  index: number,
): CalendarTransactionGroup['items'][number] {
  const categoryMeta = CATEGORY_META[transaction.category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];

  return {
    id: `${dateKey}-transaction-${index}`,
    title: transaction.merchantName,
    category: transaction.category,
    amount: transaction.amount,
    icon: categoryMeta.icon,
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

function buildMonthDateKeys(displayedMonth: Date) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDate }, (_, index) => {
    const day = index + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

function replaceMonthCalendarDaySource(
  current: CalendarDayItem[],
  displayedMonth: Date,
  nextDays: CalendarDayItem[],
) {
  const monthPrefix = getMonthPrefix(displayedMonth);
  return [...current.filter((day) => !day.dateKey.startsWith(monthPrefix)), ...nextDays];
}

function replaceMonthCalendarDayDetails(
  current: Record<string, CalendarDayDetail>,
  displayedMonth: Date,
  nextDetails: Record<string, CalendarDayDetail>,
) {
  const monthPrefix = getMonthPrefix(displayedMonth);
  const filteredEntries = Object.entries(current).filter(([dateKey]) => !dateKey.startsWith(monthPrefix));

  return Object.fromEntries([...filteredEntries, ...Object.entries(nextDetails)]);
}

function replaceMonthTransactionGroups(
  current: CalendarTransactionGroup[],
  displayedMonth: Date,
  nextGroups: CalendarTransactionGroup[],
) {
  const monthPrefix = getMonthPrefix(displayedMonth);
  return [...current.filter((group) => !group.id.startsWith(monthPrefix)), ...nextGroups].sort((a, b) =>
    a.id < b.id ? 1 : -1,
  );
}

function getMonthPrefix(displayedMonth: Date) {
  return `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthDayTitle(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}
