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
      ? `이번 달 소비 ${spentAmount == null ? '-' : `${spentAmount.toLocaleString()}원`} / 전체 예산 ${
          totalBudget == null ? '-' : `${totalBudget.toLocaleString()}원`
        }`
      : '예산을 등록하면 이번 달 소비 흐름과 남은 금액을 한눈에 확인할 수 있어요.';

    const resolvedForecastText =
      forecastText?.trim() ||
      (hasBudgetData
        ? '현재 소비 흐름을 기준으로 이번 달 예산 사용 추이를 안내해 드릴게요.'
        : '아직 등록된 예산이 없어요. 예산을 먼저 설정해 주세요.');

    const remainingValue =
      remainingBudget == null ? '예산 미등록' : `${remainingBudget.toLocaleString()}원`;
    const usageLabel =
      budgetUsageRate == null ? '사용률 준비 중' : `${budgetUsageRate}% 사용`;

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
