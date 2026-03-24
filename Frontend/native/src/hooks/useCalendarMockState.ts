import { Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import {
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
  CalendarMonthlyResponse,
  CalendarTransactionsResponse,
  FixedExpenseManageResponse,
  FixedExpenseSummaryResponse,
  ManualCalendarEntryDraft,
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
  addFixedExpense,
  confirmCalendarTransactions,
  createCashCalendarTransactions,
  createCustomCalendarTransactions,
  deleteCustomCalendarTransaction,
  deleteFixedExpense,
  getCalendarApiErrorMessage,
  getCalendarFixedExpenses,
  getCalendarDaily,
  getCalendarHeader,
  getCalendarMonthly,
  getCalendarTransactions,
  getFixedExpenseManage,
  updateFixedExpense,
  updateFixedExpenseEnable,
} from '../services/calendar';
import { useAuthStore } from '../store/authStore';

type CalendarTab = 'calendar' | 'history';

interface SelectableTransactionCandidate {
  id: string;
  backendTransactionId?: number;
  dateLabel: string;
  title: string;
  category: string;
  amount: number;
  icon: string;
  iconTone: string;
}

const BASE_OVERVIEW = {
  title: '이번 달',
  weatherTitle: '소비 날씨',
  weatherHint: '이번 달 소비 흐름을 확인해보세요.',
  savingsAmount: 101000,
  goalLabel: '이번 달 절약 금액',
};

const CATEGORY_ID_BY_KEY = buildCategoryIdMap();

export function useCalendarMockState() {
  // 첫 진입 시 실제 오늘 날짜를 기준으로 잡아야
  // 캘린더 헤더 실데이터를 바로 보여줄 수 있습니다.
  // 본문 상세 데이터는 아직 mock과 혼합해서 사용합니다.
  const today = useMemo(() => new Date(), []);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [displayedMonthOffset, setDisplayedMonthOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState('');
  const [calendarDaySource, setCalendarDaySource] = useState<CalendarDayItem[]>([]);
  const [calendarDayDetails, setCalendarDayDetails] =
    useState<Record<string, CalendarDayDetail>>({});
  const [fixedExpenseItems, setFixedExpenseItems] = useState<FixedExpenseItem[]>([]);
  const [manageItems, setManageItems] = useState<ManageFixedExpenseItem[]>([]);
  const [transactionGroups, setTransactionGroups] =
    useState<CalendarTransactionGroup[]>([]);
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [isAddEntryVisible, setIsAddEntryVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
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
      weatherTitle: liveHeader?.weatherName ?? '-',
      weatherSubtitle: monthLabel,
      weatherHint: liveHeader?.description ?? '-',
      savingsAmount: savedAmount,
      goalLabel: liveHeader ? buildSavingsLabel(savedAmount) : '-',
    };
  }, [liveHeader, monthLabel]);

  useEffect(() => {
    const currentMonth = new Date();
    const currentMonthKey = currentMonth.getFullYear() * 12 + currentMonth.getMonth();
    const displayedMonthKey = displayedMonth.getFullYear() * 12 + displayedMonth.getMonth();
    const monthDiff = currentMonthKey - displayedMonthKey;

    // 백엔드 절약 금액 계산은 현재 월/전월만 지원하므로,
    // 그보다 이전 달은 기존 mock 월 데이터를 유지해서 화면 사용성을 보장합니다.
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

        dailyResponses.forEach((dailyResponse) => {
          if (!dailyResponse) {
            return;
          }

          const mappedDetail = mapDailyResponseToDetail(dailyResponse);
          monthDetails[mappedDetail.dateKey] = mappedDetail;
        });

        const nextCalendarDaySource = mergeMonthlyAndDailyCalendarDays(
          monthlyResponse,
          dailyResponses,
        );
        setCalendarDaySource((current) =>
          replaceMonthCalendarDaySource(current, displayedMonth, nextCalendarDaySource),
        );

        setCalendarDayDetails((current) =>
          replaceMonthCalendarDayDetails(current, displayedMonth, monthDetails),
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
    if (!accessToken) {
      setTransactionGroups([]);
      return;
    }

    let isCancelled = false;

    getCalendarTransactions({
      year: displayedMonth.getFullYear(),
      month: displayedMonth.getMonth() + 1,
    })
      .then((response) => {
        if (isCancelled) {
          return;
        }

        // 거래내역 히스토리는 전용 조회 API를 기준으로 맞춰야
        // 서버 transactionId를 안정적으로 유지하면서 삭제 흐름을 연결할 수 있습니다.
        setTransactionGroups(mapCalendarTransactionsResponse(response));
      })
      .catch((error) => {
        console.warn('Failed to load calendar transactions from backend', error);
      });

    return () => {
      isCancelled = true;
    };
  }, [accessToken, displayedMonth]);

  useEffect(() => {
    if (!accessToken) {
      setFixedExpenseItems([]);
      setManageItems([]);
      return;
    }

    let isCancelled = false;
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth() + 1;

    Promise.all([
      getCalendarFixedExpenses({ year, month }),
      getFixedExpenseManage({ year, month }),
    ])
      .then(([summaryResponse, manageResponse]) => {
        if (isCancelled) {
          return;
        }

        setFixedExpenseItems(mapFixedExpenseSummaryItems(summaryResponse));
        setManageItems(mapFixedExpenseManageItems(manageResponse));
      })
      .catch((error) => {
        console.warn('Failed to load fixed expenses from backend', error);
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
  const selectableTransactions = useMemo<SelectableTransactionCandidate[]>(() => {
    if (!accessToken) {
      return [];
    }

    return filteredTransactionGroups.flatMap((group) =>
      group.items
        .filter((item) => !item.isFixedExpense && item.backendTransactionId != null)
        .map((item) => ({
          id: item.id,
          backendTransactionId: item.backendTransactionId,
          dateLabel: group.dateLabel,
          title: item.title,
          category: item.category,
          amount: item.amount,
          icon: item.icon,
          iconTone: item.iconTone,
        })),
    );
  }, [accessToken, filteredTransactionGroups]);
  const selectedTransaction = useMemo(() => {
    const selectableTransaction =
      selectableTransactions.find((item) => item.id === selectedTransactionId) ?? null;

    if (selectableTransaction) {
      return selectableTransaction;
    }

    if (!editingManageItem) {
      return null;
    }

    return {
      id: editingManageItem.id,
      backendTransactionId: undefined,
      dateLabel: editingManageItem.subtitle,
      title: editingManageItem.title,
      category: editingManageItem.category,
      amount: editingManageItem.amount,
      icon: editingManageItem.icon,
      iconTone: editingManageItem.iconTone,
    };
  }, [editingManageItem, selectableTransactions, selectedTransactionId]);
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

  async function handleRegisterFixedExpense(payload: { category: string; paymentDay: number }) {
    if (editingManageItem?.fixedExpenseId && accessToken) {
      try {
        await updateFixedExpense(editingManageItem.fixedExpenseId, {
          dueDay: payload.paymentDay,
        });

        const [summaryResponse, manageResponse] = await Promise.all([
          getCalendarFixedExpenses({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
          getFixedExpenseManage({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
        ]);

        setFixedExpenseItems(mapFixedExpenseSummaryItems(summaryResponse));
        setManageItems(mapFixedExpenseManageItems(manageResponse));
        setIsDetailSheetVisible(false);
        setEditingManageId(null);
        setIsManageModalVisible(true);
      } catch (error) {
        console.warn('Failed to update fixed expense', error);
        Alert.alert('수정 실패', '고정지출 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      return;
    }

    if (!selectedTransaction) {
      Alert.alert('선택 필요', '고정지출로 등록할 거래를 먼저 선택해주세요.');
      return;
    }

    if (accessToken) {
      if (!selectedTransaction.backendTransactionId) {
        Alert.alert('등록 불가', '거래내역 ID를 확인할 수 없어 고정지출로 등록할 수 없습니다.');
        return;
      }

      try {
        await addFixedExpense({
          transactionId: selectedTransaction.backendTransactionId,
          dueDay: payload.paymentDay,
          isAuto: false,
        });

        const [summaryResponse, manageResponse] = await Promise.all([
          getCalendarFixedExpenses({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
          getFixedExpenseManage({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
        ]);

        setFixedExpenseItems(mapFixedExpenseSummaryItems(summaryResponse));
        setManageItems(mapFixedExpenseManageItems(manageResponse));
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
      } catch (error) {
        console.warn('Failed to add fixed expense', error);
        Alert.alert(
          '등록 실패',
          getCalendarApiErrorMessage(
            error,
            '고정지출 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          ),
        );
      }
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

  async function handleToggleManageItem(id: string, nextValue: boolean) {
    const target = manageItems.find((item) => item.id === id);

    if (target?.fixedExpenseId && accessToken) {
      try {
        const response = await updateFixedExpenseEnable(target.fixedExpenseId, {
          isEnable: nextValue,
        });

        setManageItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, isEnabled: response.isEnable } : item,
          ),
        );
      } catch (error) {
        console.warn('Failed to update fixed expense enable state', error);
        Alert.alert(
          '변경 실패',
          getCalendarApiErrorMessage(
            error,
            '고정지출 활성화 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
          ),
        );
      }
      return;
    }

    setManageItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isEnabled: nextValue } : item)),
    );
  }

  async function handleDeleteManageItem(id: string) {
    const target = manageItems.find((item) => item.id === id);
    if (!target) {
      return;
    }

    if (target.fixedExpenseId && accessToken) {
      try {
        await deleteFixedExpense(target.fixedExpenseId);

        const [summaryResponse, manageResponse] = await Promise.all([
          getCalendarFixedExpenses({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
          getFixedExpenseManage({
            year: displayedMonth.getFullYear(),
            month: displayedMonth.getMonth() + 1,
          }),
        ]);

        setFixedExpenseItems(mapFixedExpenseSummaryItems(summaryResponse));
        setManageItems(mapFixedExpenseManageItems(manageResponse));
      } catch (error) {
        console.warn('Failed to delete fixed expense', error);
        Alert.alert('삭제 실패', '고정지출 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
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
    } else {
      setSelectedTransactionId(null);
    }
    setIsManageModalVisible(false);
    setIsDetailSheetVisible(true);
  }

  function handleOpenFixedExpensePicker() {
    if (selectableTransactions.length === 0) {
      Alert.alert('선택할 거래 없음', '고정지출로 등록할 거래가 아직 없습니다.');
      return;
    }

    setSelectedTransactionId((current) =>
      selectableTransactions.some((item) => item.id === current)
        ? current
        : (selectableTransactions[0]?.id ?? null),
    );
    setIsPickerVisible(true);
  }

  async function handleSaveManualEntries(entries: ManualCalendarEntryDraft[]) {
    if (entries.length === 0) {
      return;
    }

    if (accessToken) {
      const cardEntries = entries.filter((entry) => entry.paymentMethod !== 'cash');
      const cashEntries = entries.filter((entry) => entry.paymentMethod === 'cash');

      const saveTasks: Promise<unknown>[] = [];

      if (cardEntries.length > 0) {
        saveTasks.push(createCustomCalendarTransactions(buildCustomRequest(cardEntries)));
      }

      if (cashEntries.length > 0) {
        saveTasks.push(createCashCalendarTransactions(buildCustomRequest(cashEntries)));
      }

      await Promise.all(saveTasks);

      // 직접 입력 저장 직후 히스토리를 다시 조회해야
      // 서버가 발급한 transactionId를 받아 삭제/고정지출 연동에 재사용할 수 있습니다.
      const transactionsResponse = await getCalendarTransactions({
        year: displayedMonth.getFullYear(),
        month: displayedMonth.getMonth() + 1,
      });
      setTransactionGroups(mapCalendarTransactionsResponse(transactionsResponse));
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
        // confirm API는 날짜별로 기존 데이터를 지우고 다시 저장하므로
        // 날짜 단위로 나눠 순차 저장합니다.
        await confirmCalendarTransactions(request);
      }
    }

    const patch = buildManualEntryPatch(entries);
    setTransactionGroups((current) => mergeTransactionGroups(current, patch));
    setCalendarDaySource((current) => mergeCalendarDaySource(current, patch));
    setCalendarDayDetails((current) => mergeCalendarDayDetails(current, patch));
    setIsAddEntryVisible(false);
  }

  function handleDeleteHistoryTransaction(transactionId: number, dateKey: string, title: string) {
    if (!accessToken) {
      return;
    }

    const targetGroup = transactionGroups.find((group) => group.id === dateKey);
    const targetItem = targetGroup?.items.find(
      (item) => item.backendTransactionId === transactionId,
    );

    if (!targetItem) {
      Alert.alert('삭제 불가', '삭제할 거래 정보를 다시 불러온 뒤 시도해주세요.');
      return;
    }

    Alert.alert(
      '거래 삭제',
      `${title} 거래를 삭제할까요?\n삭제 후에는 되돌릴 수 없습니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomCalendarTransaction(transactionId);

              setTransactionGroups((current) =>
                removeTransactionFromGroups(current, transactionId),
              );
              setCalendarDayDetails((current) =>
                removeTransactionFromDayDetails(current, dateKey, transactionId),
              );
              setCalendarDaySource((current) =>
                removeTransactionFromDaySource(current, dateKey, targetItem.amount),
              );
            } catch (error) {
              console.warn('Failed to delete calendar transaction', error);
              Alert.alert(
                '삭제 실패',
                getCalendarApiErrorMessage(
                  error,
                  '거래 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                ),
              );
            }
          },
        },
      ],
    );
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
    selectableTransactions,
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
    handleOpenFixedExpensePicker,
    handleSaveManualEntries,
    handleSaveExcelEntries,
    handleDeleteHistoryTransaction,
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
  const derivedSpentAmount = calculateDailySpentAmount(response);
  const derivedTransactionCount = calculateDailyTransactionCount(response);

  return {
    dateKey: response.date,
    title: formatMonthDayTitle(response.date),
    weatherLabel,
    weatherHint,
    weatherTemperature: response.weather.isForecast === 1 ? '예측' : '실측',
    spentAmount: derivedSpentAmount,
    transactionCount: derivedTransactionCount,
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
    dailySpent: calculateDailySpentAmount(response) ?? 0,
    items: response.transactions.map((transaction, index) =>
      mapDailyTransactionItem(response.date, transaction, index),
    ),
  };
}

function mapCalendarTransactionsResponse(
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

function removeTransactionFromGroups(
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

function removeTransactionFromDayDetails(
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

function removeTransactionFromDaySource(
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

function mapDailyTransactionItem(
  dateKey: string,
  transaction: CalendarDailyResponse['transactions'][number],
  index: number,
): CalendarTransactionGroup['items'][number] {
  const categoryMeta = CATEGORY_META[transaction.category] ?? CATEGORY_META[DEFAULT_CALENDAR_CATEGORY];

  return {
    id: `${dateKey}-transaction-${transaction.transactionId ?? index}`,
    backendTransactionId: transaction.transactionId,
    title: transaction.merchantName,
    category: transaction.category,
    amount: transaction.amount,
    icon: categoryMeta.icon,
    iconTone: categoryMeta.iconTone,
    isFixedExpense: transaction.isFixedExpense,
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

function mergeMonthlyAndDailyCalendarDays(
  monthlyResponse: CalendarMonthlyResponse[],
  dailyResponses: Array<CalendarDailyResponse | null>,
) {
  const dayMap = new Map<string, CalendarDayItem>();

  monthlyResponse.forEach((item) => {
    dayMap.set(item.date, mapMonthlyResponseToCalendarDay(item));
  });

  dailyResponses.forEach((response) => {
    if (!response) {
      return;
    }

    const spentAmount = calculateDailySpentAmount(response);
    const existingDay = dayMap.get(response.date);

    if (existingDay) {
      if (spentAmount !== null && (existingDay.amount == null || existingDay.amount === 0)) {
        dayMap.set(response.date, {
          ...existingDay,
          amount: spentAmount,
        });
      }
      return;
    }

    if (spentAmount === null && response.transactions.length === 0) {
      return;
    }

    dayMap.set(response.date, {
      dateKey: response.date,
      dayNumber: Number(response.date.slice(-2)),
      amount: spentAmount ?? undefined,
      tone: resolveCalendarToneFromAmount(spentAmount),
      weatherTone: resolveWeatherTone(response.weather.iconCode),
      isCurrentMonth: true,
      isToday: false,
      isFuture: false,
    });
  });

  return Array.from(dayMap.values()).sort((left, right) =>
    left.dateKey > right.dateKey ? 1 : -1,
  );
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

function resolveCalendarToneFromAmount(amount: number | null) {
  if ((amount ?? 0) >= 100000) {
    return 'rose' as const;
  }

  if ((amount ?? 0) >= 50000) {
    return 'gold' as const;
  }

  return 'mint' as const;
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

function mapFixedExpenseSummaryItems(response: FixedExpenseSummaryResponse): FixedExpenseItem[] {
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

function mapFixedExpenseManageItems(response: FixedExpenseManageResponse): ManageFixedExpenseItem[] {
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

function resolveFixedExpenseStatusTone(paymentStatus: string): FixedExpenseItem['statusTone'] {
  if (paymentStatus.includes('완료')) {
    return 'done';
  }

  if (paymentStatus.startsWith('D-')) {
    return 'countdown';
  }

  return 'pending';
}
