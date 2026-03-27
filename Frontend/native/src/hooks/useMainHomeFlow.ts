import React from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type {
  HomeDashboardBudgetReportCardData,
  HomeDashboardMonthlyReportSheetData,
  HomeDashboardSpendingTypeCardData,
  HomeDashboardSpendingTypeSheetData,
  HomeDashboardWeatherCardData,
} from '../components/main/types';
import { getCalendarHeader } from '../services/calendar';
import type { AiAnalysisReport } from '../services/ai';
import {
  createBudget,
  getSpendingHalfYearly,
  getSpendingMonthlyCompare,
  type SpendingHalfYearlyResponse,
  type SpendingMonthlyCompareResponse,
} from '../services/main';
import { useAiStore } from '../store/aiStore';
import { useAuthStore } from '../store/authStore';
import type { CalendarHeaderResponse } from '../types/calendar';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../utils/aiReportPeriod';
import { extractApiErrorMessage } from '../utils/error';
import {
  buildAiSpendingMetrics,
  buildAiSpendingReasons,
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
  const sessionUserId = useAuthStore((state) => state.user?.userId ?? null);
  const sessionUserName = useAuthStore((state) => state.user?.name);
  const latestAiResult = useAiStore((state) => state.resultData);
  const refreshLatestAnalysis = useAiStore((state) => state.refreshLatestAnalysis);
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [aiAnalysis, setAiAnalysis] = React.useState<AiAnalysisReport | null>(null);
  const [spendingHalfYearly, setSpendingHalfYearly] =
    React.useState<SpendingHalfYearlyResponse | null>(null);
  const [monthlyCompare, setMonthlyCompare] =
    React.useState<SpendingMonthlyCompareResponse | null>(null);
  const [budgetAmount, setBudgetAmount] = React.useState<number | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const [isBudgetSubmitting, setIsBudgetSubmitting] = React.useState(false);
  const today = new Date();
  const reportPeriod = resolveAiReportPeriod({}, today);
  const monthLabel = `${today.getMonth() + 1}월`;

  const hasCurrentHomeAiSummary = React.useMemo(
    () => matchesAiReportPeriod(latestAiResult, reportPeriod, sessionUserId) && Boolean(latestAiResult?.report),
    [latestAiResult, reportPeriod, sessionUserId],
  );

  const loadHomeData = React.useCallback(async () => {
    if (!accessToken) {
      setLiveHeader(null);
      setAiAnalysis(null);
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

      if (hasCurrentHomeAiSummary) {
        setAiAnalysis(null);
      } else {
        const report = await refreshLatestAnalysis({
          year: reportPeriod.year,
          month: reportPeriod.month,
        });
        setAiAnalysis(report);
      }
    } catch (error) {
      console.warn('Failed to load home data from backend', error);
      setLiveHeader(null);
      setAiAnalysis(null);
      setSpendingHalfYearly(null);
      setMonthlyCompare(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [accessToken, hasCurrentHomeAiSummary, refreshLatestAnalysis, reportPeriod.month, reportPeriod.year, today]);

  useFocusEffect(
    React.useCallback(() => {
      void loadHomeData();
    }, [loadHomeData]),
  );

  // When the monthly AI report exists, the card and the bottom sheet should
  // read from the same source so users never see mixed half-yearly content.
  const homeAiSummary = (hasCurrentHomeAiSummary ? latestAiResult?.report : null) ?? aiAnalysis;

  const handleCreateBudget = React.useCallback(
    async (amount: number) => {
      setIsBudgetSubmitting(true);

      try {
        const createdBudget = await createBudget({ amount });
        setBudgetAmount(createdBudget.amount);
        closeReportModal();
        Alert.alert(
          '예산 등록 완료',
          `${createdBudget.budgetDate} 예산이 정상적으로 등록됐어요.`,
        );
      } catch (error) {
        const message = extractApiErrorMessage(
          error,
          '예산 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
        Alert.alert('예산 등록 실패', message);
      } finally {
        setIsBudgetSubmitting(false);
      }
    },
    [closeReportModal],
  );

  const spendingMetrics = React.useMemo(
    () => (homeAiSummary ? buildAiSpendingMetrics(homeAiSummary) : buildSpendingMetrics(spendingHalfYearly)),
    [homeAiSummary, spendingHalfYearly],
  );
  const spendingReasons = React.useMemo(
    () => (homeAiSummary ? buildAiSpendingReasons(homeAiSummary) : buildSpendingReasons(spendingHalfYearly)),
    [homeAiSummary, spendingHalfYearly],
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
      ? '이번 달 예산을 먼저 등록하면 이후 예산과 소비 흐름을 함께 보여드릴게요.'
      : remainingBudget != null && remainingBudget >= 0
        ? `${remainingBudget.toLocaleString()}원 정도 여유가 있어요. 지금 흐름이라면 예산 안에서 마무리할 가능성이 높습니다.`
        : `예산을 ${Math.abs(remainingBudget ?? 0).toLocaleString()}원 초과했어요. 지출 비중이 큰 항목부터 먼저 확인해보세요.`;

  const weatherCard = React.useMemo<HomeDashboardWeatherCardData>(
    () => ({
      weatherName: liveHeader?.weatherName,
      weatherDescription: liveHeader?.description,
      weatherIconCode: liveHeader?.iconCode,
      isWeatherLoading,
    }),
    [isWeatherLoading, liveHeader?.description, liveHeader?.iconCode, liveHeader?.weatherName],
  );

  const spendingTypeCard = React.useMemo<HomeDashboardSpendingTypeCardData>(
    () => ({
      spendingTypeTitle:
        homeAiSummary?.cluster.name || spendingHalfYearly?.spendingType.name,
      spendingTypeDescription:
        homeAiSummary?.goal.actionTip ||
        homeAiSummary?.cluster.description ||
        spendingHalfYearly?.spendingType.summary ||
        spendingHalfYearly?.description,
      spendingTypeIconName: homeAiSummary
        ? 'sparkles-outline'
        : resolveSpendingIconName(spendingHalfYearly?.spendingType.iconCode),
    }),
    [homeAiSummary, spendingHalfYearly],
  );

  const budgetReportCard = React.useMemo<HomeDashboardBudgetReportCardData>(
    () => ({
      monthLabel: currentMonthLabel,
      userName: sessionUserName?.trim() || '-',
      remainingBudget,
      budgetUsageRate,
      spentAmount,
      totalBudget,
      forecastText,
    }),
    [
      budgetUsageRate,
      currentMonthLabel,
      forecastText,
      remainingBudget,
      sessionUserName,
      spentAmount,
      totalBudget,
    ],
  );

  const spendingTypeSheet = React.useMemo<HomeDashboardSpendingTypeSheetData>(
    () => ({
      spendingTypeTitle:
        homeAiSummary?.cluster.name || spendingHalfYearly?.spendingType.name,
      spendingTypeIconName: homeAiSummary
        ? 'sparkles-outline'
        : resolveSpendingIconName(spendingHalfYearly?.spendingType.iconCode),
      spendingTypeDescription:
        homeAiSummary?.cluster.description ||
        homeAiSummary?.goal.actionTip ||
        spendingHalfYearly?.description,
      spendingMetrics,
      spendingReasons,
    }),
    [homeAiSummary, spendingHalfYearly, spendingMetrics, spendingReasons],
  );

  const monthlyReportSheet = React.useMemo<HomeDashboardMonthlyReportSheetData>(
    () => ({
      currentMonthLabel,
      currentMonthTotalAmount: monthlyCompare?.currentMonth.totalAmount ?? null,
      lastMonthLabel,
      lastMonthTotalAmount: monthlyCompare?.lastMonth.totalAmount ?? null,
      comparisonLegend,
      monthlyInsight,
      canCreateBudget: totalBudget == null,
      isBudgetSubmitting,
      onCreateBudget: handleCreateBudget,
    }),
    [
      comparisonLegend,
      currentMonthLabel,
      handleCreateBudget,
      isBudgetSubmitting,
      lastMonthLabel,
      monthlyCompare,
      monthlyInsight,
      totalBudget,
    ],
  );

  return {
    weatherCard,
    spendingTypeCard,
    budgetReportCard,
    spendingTypeSheet,
    monthlyReportSheet,
  };
}
