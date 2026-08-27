import { Alert } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type CalendarDayDetail,
  type CalendarDayItem,
  type CalendarTransactionGroup,
  type FixedExpenseItem,
} from '../mock/calendar';
import type {
  CalendarHeaderFetchState,
  CalendarHeaderResponse,
  ManualCalendarEntryDraft,
} from '../types/calendar';
import {
  buildMonthDays,
  buildFallbackDetail,
  createDisplayedMonth,
  extractCategoryFromSubtitle,
  formatMonthLabel,
  resolveDisplayedMonthOffset,
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
  DEFAULT_CALENDAR_CATEGORY,
} from '../constants/calendar/addEntry';
import {
  buildConfirmRequests,
  buildCustomRequest,
  buildSavingsLabel,
  mapCalendarTransactionsResponse,
  mapDailyResponseToDetail,
  mapFixedExpenseManageItems,
  mapFixedExpenseSummaryItems,
  mapMonthlyResponseToCalendarDays,
  removeTransactionFromDayDetails,
  removeTransactionFromDaySource,
  removeTransactionFromGroups,
  replaceMonthCalendarDaySource,
  replaceMonthTransactionGroups,
} from '../constants/calendar/transforms';
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
  updateCalendarMemo,
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
  const loadingCalendarDateKeysRef = useRef(new Set<string>());
  const locallyEditedMemoDateKeysRef = useRef(new Set<string>());

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

    // 메인 상단과 캘린더 헤더 날씨 기준을 맞추기 위해
    // 전전달과 다음 달까지는 백엔드 헤더를 그대로 사용합니다.
    if (!accessToken || monthDiff < -1 || monthDiff > 2) {
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
      .then((monthlyResponse) => {
        if (isCancelled) {
          return;
        }

        // 월 진입 시에는 monthly 결과만 먼저 반영하고,
        // 일별 상세는 사용자가 선택한 날짜만 lazy-load 합니다.
        const nextCalendarDaySource = mapMonthlyResponseToCalendarDays(monthlyResponse);
        setCalendarDaySource((current) =>
          replaceMonthCalendarDaySource(current, displayedMonth, nextCalendarDaySource),
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

  useEffect(() => {
    if (!accessToken || !selectedDateKey) {
      return;
    }

    if (loadingCalendarDateKeysRef.current.has(selectedDateKey)) {
      return;
    }

    loadingCalendarDateKeysRef.current.add(selectedDateKey);

    // 상세 시트가 열리는 순간에만 해당 날짜 daily를 조회해
    // 월 진입 시 daily 30회 preload를 방지합니다.
    getCalendarDaily({ date: selectedDateKey })
      .then((dailyResponse) => {
        const mappedDetail = mapDailyResponseToDetail(dailyResponse);

        setCalendarDayDetails((current) => {
          const existingDetail = current[mappedDetail.dateKey];
          const shouldKeepLocalMemo =
            locallyEditedMemoDateKeysRef.current.has(mappedDetail.dateKey) && existingDetail;

          return {
            ...current,
            [mappedDetail.dateKey]: {
              ...mappedDetail,
              memo: shouldKeepLocalMemo ? existingDetail.memo : mappedDetail.memo,
            },
          };
        });
      })
      .catch((error) => {
        console.warn('Failed to load calendar daily detail', selectedDateKey, error);
      })
      .finally(() => {
        loadingCalendarDateKeysRef.current.delete(selectedDateKey);
      });
  }, [accessToken, selectedDateKey]);

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

  async function reloadDisplayedMonthCalendarData() {
    if (!accessToken) {
      return;
    }

    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth() + 1;
    const monthlyResponse = await getCalendarMonthly({ year, month });
    const nextCalendarDaySource = mapMonthlyResponseToCalendarDays(monthlyResponse);

    setCalendarDaySource((current) =>
      replaceMonthCalendarDaySource(current, displayedMonth, nextCalendarDaySource),
    );

    if (selectedDateKey) {
      loadingCalendarDateKeysRef.current.delete(selectedDateKey);

      try {
        const dailyResponse = await getCalendarDaily({ date: selectedDateKey });
        const mappedDetail = mapDailyResponseToDetail(dailyResponse);

        setCalendarDayDetails((current) => {
          const existingDetail = current[mappedDetail.dateKey];
          const shouldKeepLocalMemo =
            locallyEditedMemoDateKeysRef.current.has(mappedDetail.dateKey) && existingDetail;

          return {
            ...current,
            [mappedDetail.dateKey]: {
              ...mappedDetail,
              memo: shouldKeepLocalMemo ? existingDetail.memo : mappedDetail.memo,
            },
          };
        });
      } catch (error) {
        console.warn('Failed to reload selected calendar daily detail', selectedDateKey, error);
      }
    }
  }

  async function reloadDisplayedMonthTransactionsData() {
    if (!accessToken) {
      return;
    }

    const transactionsResponse = await getCalendarTransactions({
      year: displayedMonth.getFullYear(),
      month: displayedMonth.getMonth() + 1,
    });

    setTransactionGroups((current) =>
      replaceMonthTransactionGroups(
        current,
        displayedMonth,
        mapCalendarTransactionsResponse(transactionsResponse),
      ),
    );
  }

  function handleMoveMonth(direction: 'prev' | 'next') {
    setDisplayedMonthOffset((current) => current + (direction === 'next' ? 1 : -1));
  }

  function handleJumpToDate(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number);

    if (!year || !month || !day) {
      return;
    }

    const targetDate = new Date(year, month - 1, day);
    if (Number.isNaN(targetDate.getTime())) {
      return;
    }

    setDisplayedMonthOffset(resolveDisplayedMonthOffset(targetDate));
    setSelectedDateKey(null);
  }

  function handleToggleFixedExpenseExpand(id: string) {
    // 요약 카드에서는 카테고리만 보이고,
    // 상세 카드는 클릭했을 때만 열리도록 확장 상태를 별도로 관리합니다.
    setFixedExpenseItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isExpanded: !item.isExpanded } : item)),
    );
  }

  async function handleRegisterFixedExpense(payload: {
    category: string;
    paymentDay: number;
    amount: number;
  }) {
    if (editingManageItem?.fixedExpenseId && accessToken) {
      try {
        await updateFixedExpense(editingManageItem.fixedExpenseId, {
          amount: payload.amount,
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
        await reloadDisplayedMonthTransactionsData();
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
        await reloadDisplayedMonthTransactionsData();
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
    const fixedExpenseAmount = editingManageId ? payload.amount : selectedTransaction.amount;

    setManageItems((current) => {
      const nextItem: ManageFixedExpenseItem = {
        id: editingManageId ?? `manage-${selectedTransaction.id}`,
        title: selectedTransaction.title,
        subtitle: `매월 ${payload.paymentDay}일 · ${payload.category}`,
        amount: fixedExpenseAmount,
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
            amount: fixedExpenseAmount,
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
        const nextCount = editingManageId ? currentCount : currentCount + 1;

        return {
          ...item,
          amount: editingManageId
            ? item.amount - selectedTransaction.amount + fixedExpenseAmount
            : item.amount + fixedExpenseAmount,
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
        await updateFixedExpenseEnable(target.fixedExpenseId, {
          isEnable: nextValue,
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
        await reloadDisplayedMonthTransactionsData();
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
      await Promise.all([
        reloadDisplayedMonthCalendarData(),
        reloadDisplayedMonthTransactionsData(),
      ]);
      setIsAddEntryVisible(false);
      return;
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

      await Promise.all([
        reloadDisplayedMonthCalendarData(),
        reloadDisplayedMonthTransactionsData(),
      ]);
      setIsAddEntryVisible(false);
      return;
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

  async function handleSaveMemo() {
    if (!selectedDateKey) {
      return;
    }

    const dateKey = selectedDateKey;
    const nextMemo = memoValue.trim();

    // 서버 응답을 기다리는 동안에도 시트를 바로 닫고 캘린더 셀에
    // 변경 사항이 즉시 보이도록 먼저 로컬 상태에 낙관적으로 반영합니다.
    locallyEditedMemoDateKeysRef.current.add(dateKey);
    setCalendarDayDetails((current) => {
      const currentDetail = current[dateKey] ?? buildFallbackDetail(dateKey);

      return {
        ...current,
        [dateKey]: {
          ...currentDetail,
          memo: nextMemo,
        },
      };
    });

    setSelectedDateKey(null);

    try {
      await updateCalendarMemo(dateKey, { memo: nextMemo });
      // 서버 저장에 성공했으므로 이후 재조회 시 로컬 값을 지키지 않아도
      // 서버 값과 동일합니다 — 로컬 보호 플래그를 해제합니다.
      locallyEditedMemoDateKeysRef.current.delete(dateKey);
    } catch (error) {
      console.warn('Failed to save calendar memo', dateKey, error);
      Alert.alert(
        '메모 저장 실패',
        getCalendarApiErrorMessage(error, '메모를 저장하지 못했어요. 잠시 후 다시 시도해주세요.'),
      );
    }
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
    weatherIconCode: liveHeader?.iconCode,
    historyTitle: monthLabel,
    emptyHistoryTitle: `${monthLabel}에는 아직 등록된 거래가 없어요`,
    emptyHistoryDescription: '직접 입력하거나 파일을 업로드하면 이달 소비 내역이 여기에 정리돼요.',
    handleMoveMonth,
    handleJumpToDate,
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
