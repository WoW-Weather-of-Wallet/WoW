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
import type { LegendListItem, SpendingStyleMetric } from '../constants/main/types';
import { extractApiErrorMessage } from '../utils/error';

const CATEGORY_COLORS = ['#E97975', '#7D8DF1', '#F3B84D', '#86D5D0', '#9D92F4', '#7DD3A7'];

const resolveSpendingIconName = (iconCode?: string | null) => {
  switch (iconCode) {
    case 'pulse-outline':
    case 'car-outline':
    case 'restaurant-outline':
    case 'book-outline':
    case 'cafe-outline':
    case 'shirt-outline':
    case 'sparkles-outline':
    case 'stats-chart-outline':
    case 'wallet-outline':
      return iconCode;
    case 'scale-balance':
      return 'stats-chart-outline';
    default:
      return 'sparkles-outline';
  }
};

const formatMonthLabel = (year?: number, month?: number) =>
  year && month ? `${year}년 ${month}월` : '-';

const buildSpendingMetrics = (
  response: SpendingHalfYearlyResponse | null,
): SpendingStyleMetric[] =>
  response?.categoryResults.slice(0, 6).map((item, index) => ({
    id: `${item.name}-${index}`,
    label: item.name,
    value: `${item.percentage}%`,
    score: item.percentage,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })) ?? [];

const buildSpendingReasons = (response: SpendingHalfYearlyResponse | null) => {
  if (!response || response.categoryResults.length === 0) {
    return [];
  }

  const topCategories = response.categoryResults.slice(0, 2);
  const tones = ['red', 'purple'] as const;

  return [
    ...topCategories.map((item, index) => ({
      title: `${item.name} 비중이 높아요`,
      description: `${item.name}이 전체 소비의 ${item.percentage}%를 차지하고 있어 현재 소비 성향을 가장 강하게 보여주는 카테고리예요.`,
      tone: tones[index],
    })),
    {
      title: '최근 소비 패턴 요약',
      description: response.description || response.spendingType.summary,
      tone: 'green' as const,
    },
  ];
};

const buildMonthlyComparisonLegend = (
  response: SpendingMonthlyCompareResponse | null,
): LegendListItem[] => {
  if (!response) {
    return [];
  }

  const currentMap = new Map(
    response.currentMonth.categories.map((item) => [item.categoryName, item.percentage]),
  );
  const lastMap = new Map(
    response.lastMonth.categories.map((item) => [item.categoryName, item.percentage]),
  );

  const names = Array.from(
    new Set([
      ...response.currentMonth.categories.map((item) => item.categoryName),
      ...response.lastMonth.categories.map((item) => item.categoryName),
    ]),
  ).slice(0, 6);

  return names.map((name, index) => ({
    id: `${name}-${index}`,
    label: name,
    value: `이번 ${currentMap.get(name) ?? 0}% · 지난 ${lastMap.get(name) ?? 0}%`,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
};

const buildMonthlyInsight = (response: SpendingMonthlyCompareResponse | null) => {
  if (!response) {
    return null;
  }

  const currentTotal = response.currentMonth.totalAmount;
  const lastTotal = response.lastMonth.totalAmount;
  const diff = currentTotal - lastTotal;
  const topCategory = response.currentMonth.categories[0]?.categoryName;

  if (currentTotal === 0 && lastTotal === 0) {
    return '이번 달과 지난달 모두 아직 집계된 소비가 없어요.';
  }

  if (diff > 0) {
    return `이번 달 소비가 지난달보다 ${diff.toLocaleString()}원 많아요.${topCategory ? ` 특히 ${topCategory} 비중을 먼저 확인해보세요.` : ''}`;
  }

  if (diff < 0) {
    return `이번 달 소비가 지난달보다 ${Math.abs(diff).toLocaleString()}원 줄었어요.${topCategory ? ` 현재 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
  }

  return `이번 달 소비는 지난달과 비슷한 수준이에요.${topCategory ? ` 가장 큰 비중은 ${topCategory}입니다.` : ''}`;
};

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
