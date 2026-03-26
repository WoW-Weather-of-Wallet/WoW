import React from 'react';

import type {
  HomeDashboardMonthlyReportSheetData,
  HomeDashboardSpendingTypeSheetData,
} from './types';
import HomeMonthlyReportSheet from './HomeMonthlyReportSheet';
import HomeSpendingTypeSheet from './HomeSpendingTypeSheet';

const MONTHLY_REPORT_SUBTITLE =
  "?챘흸???씸??횗?챘?슿?챦짠탑횂??챙?쇺▣モ볛??챘큄짰챠?걔?㎮샚?챕혥짰챗쩐짠챠?쨀?챙?왖띊?궗짭 ?챘혥?걘ぢ뜯??챗쨀쨔챗쨔짯챌?샚??창?샕Ｃ?띉?챔쨔?????챘혥?걘ヂ셋??";

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
