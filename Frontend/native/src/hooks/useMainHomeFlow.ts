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
import { getAiAnalysis, type AiAnalysisReport } from '../services/ai';
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
  const accessToken = useAuthStore(state => state.accessToken);
  const sessionUserName = useAuthStore(state => state.user?.name);
  const latestAiReport = useAiStore(state => state.resultData?.report as AiAnalysisReport | null);
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [aiAnalysis, setAiAnalysis] = React.useState<AiAnalysisReport | null>(null);
  const [spendingHalfYearly, setSpendingHalfYearly] =
    React.useState<SpendingHalfYearlyResponse | null>(null);
  const [monthlyCompare, setMonthlyCompare] =
    React.useState<SpendingMonthlyCompareResponse | null>(null);
  const [budgetAmount, setBudgetAmount] = React.useState<number | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const [isBudgetSubmitting, setIsBudgetSubmitting] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const monthLabel = `${today.getMonth() + 1}??`;

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

      void getAiAnalysis()
        .then((response) => {
          setAiAnalysis(response);
        })
        .catch((error) => {
          console.warn('Failed to load AI analysis summary for home card', error);
          setAiAnalysis(null);
        });
    } catch (error) {
      console.warn('Failed to load home data from backend', error);
      setLiveHeader(null);
      setAiAnalysis(null);
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
        Alert.alert('?덉궛 ?깅줉 ?꾨즺', `${createdBudget.budgetDate} ?덉궛???깅줉?섏뿀?듬땲??`);
      } catch (error) {
        const message = extractApiErrorMessage(
          error,
          '?대쾲 ???덉궛 ?깅줉 以?臾몄젣媛 諛쒖깮?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.',
        );
        Alert.alert('?덉궛 ?깅줉 ?ㅽ뙣', message);
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
      ? '?대쾲 ???덉궛???깅줉?섎㈃ ?⑥? ?덉궛怨??ъ슜瑜좎쓣 諛붾줈 ?뺤씤?????덉뼱??'
      : remainingBudget != null && remainingBudget >= 0
        ? `${remainingBudget.toLocaleString()}?먯씠 ?⑥븘 ?덉뼱?? 吏湲??띾룄瑜??좎??대낫?몄슂.`
        : `?덉궛??${Math.abs(remainingBudget ?? 0).toLocaleString()}??珥덇낵?덉뼱?? 吏異?議곗젙???꾩슂?댁슂.`;

  const weatherCard = React.useMemo<HomeDashboardWeatherCardData>(
    () => ({
      weatherName: liveHeader?.weatherName,
      weatherDescription: liveHeader?.description,
      weatherIconCode: liveHeader?.iconCode,
      isWeatherLoading,
    }),
    [isWeatherLoading, liveHeader?.description, liveHeader?.iconCode, liveHeader?.weatherName],
  );

  const homeAiSummary = latestAiReport ?? aiAnalysis;

  const spendingTypeCard = React.useMemo<HomeDashboardSpendingTypeCardData>(
    () => ({
      spendingTypeTitle:
        homeAiSummary?.cluster.name || spendingHalfYearly?.spendingType.name,
      spendingTypeDescription:
        homeAiSummary?.goal.actionTip
        || homeAiSummary?.cluster.description
        || spendingHalfYearly?.spendingType.summary
        || spendingHalfYearly?.description,
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
        homeAiSummary?.cluster.description
        || homeAiSummary?.goal.actionTip
        || spendingHalfYearly?.description,
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
