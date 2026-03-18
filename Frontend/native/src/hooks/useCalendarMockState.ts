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
  type CalendarTransactionItem,
  type FixedExpenseItem,
} from '../mock/calendar';
import {
  buildFallbackDetail,
  buildMonthDays,
  CATEGORY_META,
  createDisplayedMonth,
  extractCategoryFromSubtitle,
  formatMonthLabel,
  formatDateTitle,
  type ManageFixedExpenseItem,
} from '../constants/calendar/state';
import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';
import type { ManualCalendarEntryDraft } from '../components/calendar/CalendarAddEntrySheet';

type CalendarTab = 'calendar' | 'history';

const BASE_OVERVIEW = {
  title: '캘린더',
  weatherTitle: '구름 · 주의',
  weatherHint: '외식 지출 패턴 감지됨',
  savingsAmount: 101000,
  goalLabel: '목표 달성 중',
};

export function useCalendarMockState() {
  const today = useMemo(() => new Date(2025, 5, 12), []);

  const [displayedMonthOffset, setDisplayedMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState('');
  const [calendarDaySource, setCalendarDaySource] = useState<CalendarDayItem[]>(mockCalendarDays);
  const [calendarDayDetails, setCalendarDayDetails] =
    useState<Record<string, CalendarDayDetail>>(mockCalendarDayDetails);
  const [fixedExpenseItems, setFixedExpenseItems] = useState<FixedExpenseItem[]>(mockFixedExpenses);
  const [manageItems, setManageItems] = useState<ManageFixedExpenseItem[]>(
    () =>
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

  const sourceDaysByKey = useMemo(
    () => new Map(calendarDaySource.map((day) => [day.dateKey, day])),
    [calendarDaySource],
  );
  const displayedMonth = useMemo(
    () => createDisplayedMonth(displayedMonthOffset),
    [displayedMonthOffset],
  );
  const monthLabel = useMemo(() => formatMonthLabel(displayedMonth), [displayedMonth]);
  const calendarDays = useMemo(
    () => buildMonthDays(displayedMonth, today, sourceDaysByKey),
    [displayedMonth, sourceDaysByKey, today],
  );
  const historyMonthKey = useMemo(
    () =>
      `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}`,
    [displayedMonth],
  );

  const overview = useMemo(() => {
    return {
      ...BASE_OVERVIEW,
      monthLabel,
      weatherSubtitle: monthLabel,
    };
  }, [monthLabel]);

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
    if (selectedDetail) {
      setMemoValue(selectedDetail.memo);
    }
  }, [selectedDetail]);

  const selectedTransaction = useMemo(
    () =>
      mockSelectableTransactions.find((item) => item.id === selectedTransactionId) ?? null,
    [selectedTransactionId],
  );
  const editingManageItem = useMemo(
    () => manageItems.find((item) => item.id === editingManageId) ?? null,
    [editingManageId, manageItems],
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

    const lastDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
    const defaultDay = displayedMonthOffset === 0 ? Math.min(today.getDate(), lastDate) : 1;
    return `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}-${String(defaultDay).padStart(2, '0')}`;
  }, [displayedMonth, displayedMonthOffset, selectedDateKey, today]);

  function handleMoveMonth(direction: 'prev' | 'next') {
    setDisplayedMonthOffset((current) => current + (direction === 'next' ? 1 : -1));
  }

  function handleRegisterFixedExpense(payload: { category: string; paymentDay: number }) {
    if (!selectedTransaction) {
      return;
    }

    const categoryMeta = CATEGORY_META[payload.category] ?? CATEGORY_META['기타'];

    setManageItems((current) => {
      const nextItem: ManageFixedExpenseItem = {
        id: editingManageId ?? `manage-${selectedTransaction.id}`,
        title: selectedTransaction.title,
        subtitle: `매월 ${payload.paymentDay}일 ${payload.category}`,
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

  function handleSaveManualEntries(entries: ManualCalendarEntryDraft[]) {
    if (entries.length === 0) {
      return;
    }

    const nextItemsByDate = new Map<string, CalendarTransactionItem[]>();
    const nextAmountByDate = new Map<string, number>();

    entries.forEach((entry, index) => {
      const categoryMeta = CATEGORY_META[entry.category] ?? CATEGORY_META['기타'];
      const transactionItem: CalendarTransactionItem = {
        id: `manual-${entry.dateKey}-${Date.now()}-${index}`,
        title: entry.merchantName,
        category: entry.category,
        amount: entry.amount,
        time: '직접 입력',
        icon: categoryMeta.icon,
        iconTone: categoryMeta.iconTone,
      };

      nextItemsByDate.set(entry.dateKey, [...(nextItemsByDate.get(entry.dateKey) ?? []), transactionItem]);
      nextAmountByDate.set(entry.dateKey, (nextAmountByDate.get(entry.dateKey) ?? 0) + entry.amount);
    });

    setTransactionGroups((current) => {
      const grouped = new Map(current.map((group) => [group.id, group]));

      nextItemsByDate.forEach((items, dateKey) => {
        const existingGroup = grouped.get(dateKey);
        const nextDailySpent = (existingGroup?.dailySpent ?? 0) + items.reduce((sum, item) => sum + item.amount, 0);

        grouped.set(dateKey, {
          id: dateKey,
          dateLabel: formatDateTitle(dateKey),
          dailySpent: nextDailySpent,
          items: [...items, ...(existingGroup?.items ?? [])],
        });
      });

      return Array.from(grouped.values()).sort((a, b) => (a.id < b.id ? 1 : -1));
    });

    setCalendarDaySource((current) => {
      const dayMap = new Map(current.map((day) => [day.dateKey, day]));

      nextAmountByDate.forEach((amount, dateKey) => {
        const existingDay = dayMap.get(dateKey);
        const [, , dayNumberRaw] = dateKey.split('-');
        const dayNumber = Number(dayNumberRaw);

        if (existingDay) {
          dayMap.set(dateKey, {
            ...existingDay,
            amount: (existingDay.amount ?? 0) + amount,
            isFuture: false,
          });
          return;
        }

        dayMap.set(dateKey, {
          dateKey,
          dayNumber,
          amount,
          tone: 'primary',
          weatherTone: 'cloudy',
          isCurrentMonth: true,
          isFuture: false,
        });
      });

      return Array.from(dayMap.values());
    });

    setCalendarDayDetails((current) => {
      const nextDetails = { ...current };

      nextItemsByDate.forEach((items, dateKey) => {
        const existingDetail = nextDetails[dateKey] ?? buildFallbackDetail(dateKey);
        nextDetails[dateKey] = {
          ...existingDetail,
          title: formatDateTitle(dateKey),
          spentAmount: (existingDetail.spentAmount ?? 0) + items.reduce((sum, item) => sum + item.amount, 0),
          transactionCount: (existingDetail.transactionCount ?? 0) + items.length,
          items: [...items, ...existingDetail.items],
        };
      });

      return nextDetails;
    });

    setIsAddEntryVisible(false);
  }

  return {
    overview,
    monthLabel,
    calendarDays,
    activeTab,
    selectedDateKey,
    memoValue,
    fixedExpenseItems,
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
    handleMoveMonth,
    historyTitle: monthLabel,
    emptyHistoryTitle: `${monthLabel} 내역이 없어요`,
    emptyHistoryDescription: `${monthLabel}에는 아직 추가된 거래 내역이 없습니다.`,
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
  };
}
