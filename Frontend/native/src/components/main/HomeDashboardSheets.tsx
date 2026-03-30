import React from 'react';

import type {
  HomeDashboardMonthlyReportSheetData,
  HomeDashboardSpendingTypeSheetData,
} from './types';
import HomeMonthlyReportSheet from './HomeMonthlyReportSheet';
import HomeSpendingTypeSheet from './HomeSpendingTypeSheet';

const MONTHLY_REPORT_SUBTITLE =
  '이번 달과 지난달 소비 흐름을 비교해서 현재 예산 상태를 한눈에 확인할 수 있어요.';

interface HomeDashboardSheetsProps {
  isSpendingTypeVisible: boolean;
  isReportVisible: boolean;
  spendingTypeSheet: HomeDashboardSpendingTypeSheetData;
  monthlyReportSheet: HomeDashboardMonthlyReportSheetData;
  onCloseSpendingType: () => void;
  onCloseReport: () => void;
}

export default function HomeDashboardSheets({
  isSpendingTypeVisible,
  isReportVisible,
  spendingTypeSheet,
  monthlyReportSheet,
  onCloseSpendingType,
  onCloseReport,
}: HomeDashboardSheetsProps) {
  return (
    <>
      <HomeSpendingTypeSheet
        visible={isSpendingTypeVisible}
        onClose={onCloseSpendingType}
        title={spendingTypeSheet.spendingTypeTitle}
        iconName={spendingTypeSheet.spendingTypeIconName}
        description={spendingTypeSheet.spendingTypeDescription}
        metrics={spendingTypeSheet.spendingMetrics}
        reasons={spendingTypeSheet.spendingReasons}
      />
      <HomeMonthlyReportSheet
        visible={isReportVisible}
        onClose={onCloseReport}
        subtitle={MONTHLY_REPORT_SUBTITLE}
        currentMonthLabel={monthlyReportSheet.currentMonthLabel}
        currentTotalAmount={monthlyReportSheet.currentMonthTotalAmount}
        lastMonthLabel={monthlyReportSheet.lastMonthLabel}
        lastTotalAmount={monthlyReportSheet.lastMonthTotalAmount}
        comparisonLegend={monthlyReportSheet.comparisonLegend}
        insightText={monthlyReportSheet.monthlyInsight}
        canCreateBudget={monthlyReportSheet.canCreateBudget}
        isCreatingBudget={monthlyReportSheet.isBudgetSubmitting}
        onCreateBudget={monthlyReportSheet.onCreateBudget}
      />
    </>
  );
}
