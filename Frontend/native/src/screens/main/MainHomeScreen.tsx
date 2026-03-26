import React from 'react';
import { hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
import { useMainHomeFlow } from '../../hooks/useMainHomeFlow';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import { HomeDashboardContent, HomeDashboardSheets } from '../../components/main';

export default function MainHomeScreen() {
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const {
    liveHeader,
    spendingTypeTitle,
    spendingTypeDescription,
    spendingTypeIconName,
    spendingTypeSheetDescription,
    currentMonthLabel,
    lastMonthLabel,
    currentMonthTotalAmount,
    lastMonthTotalAmount,
    displayUserName,
    remainingBudget,
    budgetUsageRate,
    spentAmount,
    totalBudget,
    forecastText,
    spendingMetrics,
    spendingReasons,
    comparisonLegend,
    monthlyInsight,
    isWeatherLoading,
    isBudgetSubmitting,
    handleCreateBudget,
  } = useMainHomeFlow({
    closeReportModal: reportModal.close,
  });

  return (
    <>
      <BottomTabScreenLayout
        containerStyle={styles.container}
        contentContainerStyle={styles.contentContainer}
        scrollTopPadding={hp(12)}
        scrollBottomPadding={hp(30)}
      >
        <HomeDashboardContent
          weatherName={liveHeader?.weatherName}
          weatherDescription={liveHeader?.description}
          weatherIconCode={liveHeader?.iconCode}
          isWeatherLoading={isWeatherLoading}
          spendingTypeTitle={spendingTypeTitle}
          spendingTypeDescription={spendingTypeDescription}
          spendingTypeIconName={spendingTypeIconName}
          monthLabel={currentMonthLabel}
          userName={displayUserName}
          remainingBudget={remainingBudget}
          budgetUsageRate={budgetUsageRate}
          spentAmount={spentAmount}
          totalBudget={totalBudget}
          forecastText={forecastText}
          onPressSpendingType={spendingTypeModal.open}
          onPressBudgetReport={reportModal.open}
        />
      </BottomTabScreenLayout>

      <HomeDashboardSheets
        isSpendingTypeVisible={spendingTypeModal.visible}
        isReportVisible={reportModal.visible}
        spendingTypeTitle={spendingTypeTitle}
        spendingTypeIconName={spendingTypeIconName}
        spendingTypeDescription={spendingTypeSheetDescription}
        spendingMetrics={spendingMetrics}
        spendingReasons={spendingReasons}
        currentMonthLabel={currentMonthLabel}
        currentMonthTotalAmount={currentMonthTotalAmount}
        lastMonthLabel={lastMonthLabel}
        lastMonthTotalAmount={lastMonthTotalAmount}
        comparisonLegend={comparisonLegend}
        monthlyInsight={monthlyInsight}
        canCreateBudget={totalBudget == null}
        isBudgetSubmitting={isBudgetSubmitting}
        onCloseSpendingType={spendingTypeModal.close}
        onCloseReport={reportModal.close}
        onCreateBudget={handleCreateBudget}
      />
    </>
  );
}
