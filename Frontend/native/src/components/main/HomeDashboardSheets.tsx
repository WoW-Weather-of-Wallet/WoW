import React from 'react';
import type { LegendListItem, SpendingStyleMetric } from '../../constants/main/types';
import HomeMonthlyReportSheet from './HomeMonthlyReportSheet';
import HomeSpendingTypeSheet from './HomeSpendingTypeSheet';

interface HomeDashboardSheetsProps {
  isSpendingTypeVisible: boolean;
  isReportVisible: boolean;
  spendingTypeTitle?: string | null;
  spendingTypeIconName?: React.ComponentProps<typeof HomeSpendingTypeSheet>['iconName'];
  spendingTypeDescription?: string | null;
  spendingMetrics: SpendingStyleMetric[];
  spendingReasons: React.ComponentProps<typeof HomeSpendingTypeSheet>['reasons'];
  currentMonthLabel: string;
  currentMonthTotalAmount?: number | null;
  lastMonthLabel: string;
  lastMonthTotalAmount?: number | null;
  comparisonLegend: LegendListItem[];
  monthlyInsight?: string | null;
  canCreateBudget: boolean;
  isBudgetSubmitting: boolean;
  onCloseSpendingType: () => void;
  onCloseReport: () => void;
  onCreateBudget: (amount: number) => Promise<void> | void;
}

export default function HomeDashboardSheets({
  isSpendingTypeVisible,
  isReportVisible,
  spendingTypeTitle,
  spendingTypeIconName,
  spendingTypeDescription,
  spendingMetrics,
  spendingReasons,
  currentMonthLabel,
  currentMonthTotalAmount,
  lastMonthLabel,
  lastMonthTotalAmount,
  comparisonLegend,
  monthlyInsight,
  canCreateBudget,
  isBudgetSubmitting,
  onCloseSpendingType,
  onCloseReport,
  onCreateBudget,
}: HomeDashboardSheetsProps) {
  return (
    <>
      <HomeSpendingTypeSheet
        visible={isSpendingTypeVisible}
        onClose={onCloseSpendingType}
        title={spendingTypeTitle}
        iconName={spendingTypeIconName}
        description={spendingTypeDescription}
        metrics={spendingMetrics}
        reasons={spendingReasons}
      />
      <HomeMonthlyReportSheet
        visible={isReportVisible}
        onClose={onCloseReport}
        subtitle="?ëŒ€ì¾² ?Ñˆë‚µ ï§žÂ€?ì’•ë–– ?ëš®í‰¬ç‘œ?é®ê¾§íƒ³?ì„í€¬ ?ë‰ê¶› ?ê³¹ê¹­ç‘œ??â‘£í¡ è¹‚????ë‰ë¼±??"
        currentMonthLabel={currentMonthLabel}
        currentTotalAmount={currentMonthTotalAmount}
        lastMonthLabel={lastMonthLabel}
        lastTotalAmount={lastMonthTotalAmount}
        comparisonLegend={comparisonLegend}
        insightText={monthlyInsight}
        canCreateBudget={canCreateBudget}
        isCreatingBudget={isBudgetSubmitting}
        onCreateBudget={onCreateBudget}
      />
    </>
  );
}
