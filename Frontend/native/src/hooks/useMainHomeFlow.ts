import React from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCalendarHeader } from '../services/calendar';
import {
  createBudget,
  getSpendingHalfYearly,
  getSpendingMonthlyCompare,
  type SpendingHalfYearlyResponse,
  type SpendingMonthlyCompareResponse,
} from '../services/main';
import { useAuthStore } from '../store/authStore';
import type { CalendarHeaderResponse } from '../types/calendar';
import { extractApiErrorMessage } from '../utils/error';
import {
  buildMonthlyComparisonLegend,
  buildMonthlyInsight,
  buildSpendingMetrics,
  buildSpendingReasons,
  formatMonthLabel,
  resolveSpendingIconName,
} from '../utils/mainHomePresentation';

interface UseMainHomeFlowParams {
  closeReportModal: () => void;
}

export function useMainHomeFlow({ closeReportModal }: UseMainHomeFlowParams) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionUserName = useAuthStore((state) => state.user?.name);
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [spendingHalfYearly, setSpendingHalfYearly] = React.useState<SpendingHalfYearlyResponse | null>(null);
  const [monthlyCompare, setMonthlyCompare] = React.useState<SpendingMonthlyCompareResponse | null>(null);
  const [budgetAmount, setBudgetAmount] = React.useState<number | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const [isBudgetSubmitting, setIsBudgetSubmitting] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const monthLabel = `${today.getMonth() + 1}월`;

  const loadHomeData = React.useCallback(async () => {
    if (!accessToken) {
      setLiveHeader(null);
      setSpendingHalfYearly(null);
      setMonthlyCompare(null);
      setIsWeatherLoading(false);
      return;
    }

    setIsWeatherLoading(true);

    try {
      const [headerResponse, halfYearlyResponse, monthlyCompareResponse] = await Promise.all([
        getCalendarHeader({
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        }),
        getSpendingHalfYearly(),
        getSpendingMonthlyCompare(),
      ]);

      setLiveHeader(headerResponse);
      setSpendingHalfYearly(halfYearlyResponse);
      setMonthlyCompare(monthlyCompareResponse);
    } catch (error) {
      console.warn('Failed to load home data from backend', error);
      setLiveHeader(null);
      setSpendingHalfYearly(null);
      setMonthlyCompare(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [accessToken, today]);

  useFocusEffect(
    React.useCallback(() => {
      void loadHomeData();
    }, [loadHomeData]),
  );

  const handleCreateBudget = React.useCallback(
    async (amount: number) => {
      setIsBudgetSubmitting(true);

      try {
        const createdBudget = await createBudget({ amount });
        setBudgetAmount(createdBudget.amount);
        closeReportModal();
        Alert.alert('예산 등록 완료', `${createdBudget.budgetDate} 예산이 등록되었습니다.`);
      } catch (error) {
        const message = extractApiErrorMessage(
          error,
          '이번 달 예산 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
        Alert.alert('예산 등록 실패', message);
      } finally {
        setIsBudgetSubmitting(false);
      }
    },
    [closeReportModal],
  );

  const spendingMetrics = React.useMemo(
    () => buildSpendingMetrics(spendingHalfYearly),
    [spendingHalfYearly],
  );
  const spendingReasons = React.useMemo(
    () => buildSpendingReasons(spendingHalfYearly),
    [spendingHalfYearly],
  );
  const comparisonLegend = React.useMemo(
    () => buildMonthlyComparisonLegend(monthlyCompare),
    [monthlyCompare],
  );
  const monthlyInsight = React.useMemo(
    () => buildMonthlyInsight(monthlyCompare),
    [monthlyCompare],
  );

  const currentMonthLabel = monthlyCompare
    ? formatMonthLabel(monthlyCompare.currentMonth.year, monthlyCompare.currentMonth.month)
    : monthLabel;
  const lastMonthLabel = monthlyCompare
    ? formatMonthLabel(monthlyCompare.lastMonth.year, monthlyCompare.lastMonth.month)
    : '-';

  const spentAmount = monthlyCompare?.currentMonth.totalAmount ?? null;
  const totalBudget = budgetAmount;
  const remainingBudget =
    totalBudget != null && spentAmount != null ? totalBudget - spentAmount : null;
  const budgetUsageRate =
    totalBudget && totalBudget > 0 && spentAmount != null
      ? Math.max(0, Math.min(Math.round((spentAmount / totalBudget) * 100), 100))
      : null;
  const forecastText =
    totalBudget == null
      ? '이번 달 예산을 등록하면 남은 예산과 사용률을 바로 확인할 수 있어요.'
      : remainingBudget != null && remainingBudget >= 0
        ? `${remainingBudget.toLocaleString()}원이 남아 있어요. 지금 속도를 유지해보세요.`
        : `예산을 ${Math.abs(remainingBudget ?? 0).toLocaleString()}원 초과했어요. 지출 조정이 필요해요.`;

  return {
    liveHeader,
    spendingHalfYearly,
    currentMonthLabel,
    lastMonthLabel,
    spentAmount,
    totalBudget,
    remainingBudget,
    budgetUsageRate,
    forecastText,
    spendingMetrics,
    spendingReasons,
    comparisonLegend,
    monthlyInsight,
    displayUserName: sessionUserName?.trim() || '-',
    isWeatherLoading,
    isBudgetSubmitting,
    handleCreateBudget,
    spendingTypeIconName: resolveSpendingIconName(spendingHalfYearly?.spendingType.iconCode),
    spendingTypeTitle: spendingHalfYearly?.spendingType.name,
    spendingTypeDescription:
      spendingHalfYearly?.spendingType.summary || spendingHalfYearly?.description,
    spendingTypeSheetDescription: spendingHalfYearly?.description,
    currentMonthTotalAmount: monthlyCompare?.currentMonth.totalAmount ?? null,
    lastMonthTotalAmount: monthlyCompare?.lastMonth.totalAmount ?? null,
  };
}
