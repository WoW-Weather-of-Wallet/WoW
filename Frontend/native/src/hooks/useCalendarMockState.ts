import { useEffect, useMemo, useState } from 'react';
import {
  mockCalendarDays,
  mockCalendarDayDetails,
  mockCalendarOverview,
  mockCalendarTransactions,
  mockFixedExpenses,
  mockManageFixedExpenses,
  mockSelectableTransactions,
  type CalendarTransactionGroup,
  type FixedExpenseItem,
} from '../mock/calendar';
import {
  buildFallbackDetail,
  buildMonthDays,
  CATEGORY_META,
  createDisplayedMonth,
  extractCategoryFromSubtitle,
  formatMonthLabel,
  type ManageFixedExpenseItem,
} from '../constants/calendar/state';

type CalendarTab = 'calendar' | 'history';

/**
 * 캘린더 화면 전체에서 공유하는 mock 상태를 한곳에서 관리합니다.
 * API가 붙기 전까지는 월 이동, 날짜 선택, 고정지출 관리 흐름을 모두 여기서 조합합니다.
 */
export function useCalendarMockState() {
  const sourceDaysByKey = useMemo(
    () => new Map(mockCalendarDays.map((day) => [day.dateKey, day])),
    [],
  );
  const today = useMemo(() => new Date(2025, 5, 12), []);

  const [displayedMonthOffset, setDisplayedMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState('');
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
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>('pick-3');
  const [editingManageId, setEditingManageId] = useState<string | null>(null);

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
    if (historyMonthKey === '2025-06') {
      return {
        ...mockCalendarOverview,
        monthLabel,
      };
    }

    return {
      ...mockCalendarOverview,
      monthLabel,
      weatherTitle: '소비 기록 확인',
      weatherSubtitle: monthLabel,
      weatherHint: '이 달의 소비 내역과 메모를 미리 정리해둘 수 있어요.',
      savingsAmount: 0,
      goalLabel: '기록 준비 중',
    };
  }, [historyMonthKey, monthLabel]);

  useEffect(() => {
    // 월이 바뀌면 이전 달에서 열어둔 상세 시트는 닫아 현재 월에만 집중시킵니다.
    setSelectedDateKey(null);
  }, [displayedMonthOffset]);

  const selectedDetail = useMemo(() => {
    if (!selectedDateKey) {
      return null;
    }

    return mockCalendarDayDetails[selectedDateKey] ?? buildFallbackDetail(selectedDateKey);
  }, [selectedDateKey]);

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
            subtitle: '1개 항목',
            amount: selectedTransaction.amount,
            statusLabel: `D-${payload.paymentDay}`,
            statusTone: 'countdown',
            icon: categoryMeta.icon,
            iconTone: categoryMeta.iconTone,
            countLabel: '1개 항목',
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
          subtitle: `${nextCount}개 항목`,
          countLabel: `${nextCount}개 항목`,
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
          item.title === selectedTransaction.title &&
          item.category === selectedTransaction.category &&
          item.amount === selectedTransaction.amount
            ? { ...item, isFixedExpense: true }
            : item,
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
            subtitle: `${nextCount}개 항목`,
            countLabel: `${nextCount}개 항목`,
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
    selectedTransactionId,
    selectedDetail,
    selectedTransaction,
    editingManageItem,
    fixedExpensesTotal,
    handleMoveMonth,
    historyTitle: monthLabel,
    emptyHistoryTitle: `${monthLabel} 내역이 없습니다`,
    emptyHistoryDescription: `${monthLabel}에는 아직 등록된 소비 내역이 없습니다.`,
    setActiveTab,
    setSelectedDateKey,
    setMemoValue,
    setIsManageModalVisible,
    setIsPickerVisible,
    setIsDetailSheetVisible,
    setSelectedTransactionId,
    setEditingManageId,
    handleRegisterFixedExpense,
    handleToggleManageItem,
    handleDeleteManageItem,
    handleEditManageItem,
  };
}
