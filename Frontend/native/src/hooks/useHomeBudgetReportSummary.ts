import React from 'react';

interface UseHomeBudgetReportSummaryParams {
  userName?: string | null;
  remainingBudget?: number | null;
  budgetUsageRate?: number | null;
  spentAmount?: number | null;
  totalBudget?: number | null;
  forecastText?: string | null;
}

export function useHomeBudgetReportSummary({
  userName,
  remainingBudget,
  budgetUsageRate,
  spentAmount,
  totalBudget,
  forecastText,
}: UseHomeBudgetReportSummaryParams) {
  return React.useMemo(() => {
    const usageRate = Math.max(0, Math.min(budgetUsageRate ?? 0, 100));
    const hasBudgetData = [remainingBudget, budgetUsageRate, spentAmount, totalBudget].some(
      (value) => value != null,
    );
    const trimmedUserName = userName?.trim();
    const helperMessage = hasBudgetData
      ? `이번 달 소비 ${spentAmount == null ? '-' : `${spentAmount.toLocaleString()}원`} / 총 예산 ${
          totalBudget == null ? '-' : `${totalBudget.toLocaleString()}원`
        }`
      : '지출 데이터가 쌓이면 이번 달 예산 흐름을 정확하게 안내해드릴게요.';
    const resolvedForecastText =
      forecastText?.trim() ||
      (hasBudgetData
        ? '월말 예측 문구를 곧 보여드릴게요.'
        : '월간 리포트를 열어 소비 패턴과 절약 팁을 먼저 확인해보세요.');
    const remainingValue =
      remainingBudget == null ? '준비 중' : `${remainingBudget.toLocaleString()}원`;
    const usageLabel = budgetUsageRate == null ? '예산 분석 대기' : `${budgetUsageRate}% 사용`;

    return {
      usageRate,
      hasBudgetData,
      trimmedUserName,
      helperMessage,
      forecastMessage: resolvedForecastText,
      remainingValue,
      usageLabel,
    };
  }, [budgetUsageRate, forecastText, remainingBudget, spentAmount, totalBudget, userName]);
}
