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
      : '이번 달 예산을 등록하면 남은 금액과 소비 흐름을 한눈에 확인할 수 있어요.';

    const resolvedForecastText =
      forecastText?.trim() ||
      (hasBudgetData
        ? '현재 소비 흐름을 기준으로 이번 달 예산 사용 추이를 안내해 드릴게요.'
        : '이번 달 예산을 먼저 설정하면 소비 추이를 보기 쉽게 안내해 드릴게요.');

    const remainingValue =
      remainingBudget == null ? '예산을 설정해 보세요' : `${remainingBudget.toLocaleString()}원`;
    const usageLabel =
      budgetUsageRate == null ? '예산 등록 후 사용률 표시' : `${budgetUsageRate}% 사용`;

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
