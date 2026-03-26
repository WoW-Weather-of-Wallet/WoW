import React from 'react';
import { hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
import { useMainHomeFlow } from '../../hooks/useMainHomeFlow';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import {
  HomeBudgetReportCard,
  HomeMonthlyReportSheet,
  HomeScheduleSection,
  HomeSpendingTypeCard,
  HomeSpendingTypeSheet,
  HomeTodayWeatherCard,
} from '../../components/main';

export default function MainHomeScreen() {
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const {
    liveHeader,
    spendingTypeTitle,
    spendingTypeDescription,
    spendingTypeIconName,
    spendingTypeSheetDescription,
    spendingHalfYearly,
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
        <HomeTodayWeatherCard
          weatherName={liveHeader?.weatherName}
          description={liveHeader?.description}
          iconCode={liveHeader?.iconCode}
          isLoading={isWeatherLoading}
        />
        <HomeSpendingTypeCard
          onPress={spendingTypeModal.open}
          title={spendingTypeTitle}
          description={spendingTypeDescription}
          iconName={spendingTypeIconName}
        />
        <HomeBudgetReportCard
          monthLabel={currentMonthLabel}
          userName={displayUserName}
          remainingBudget={remainingBudget}
          budgetUsageRate={budgetUsageRate}
          spentAmount={spentAmount}
          totalBudget={totalBudget}
          forecastText={forecastText}
          onPress={reportModal.open}
        />
        <HomeScheduleSection items={[]} />
      </BottomTabScreenLayout>

      <HomeSpendingTypeSheet
        visible={spendingTypeModal.visible}
        onClose={spendingTypeModal.close}
        title={spendingTypeTitle}
        iconName={spendingTypeIconName}
        description={spendingTypeSheetDescription}
        metrics={spendingMetrics}
        reasons={spendingReasons}
      />
      <HomeMonthlyReportSheet
        visible={reportModal.visible}
        onClose={reportModal.close}
        subtitle="이번 달과 지난달 소비를 비교하고 예산 상태를 함께 볼 수 있어요."
        currentMonthLabel={currentMonthLabel}
        currentTotalAmount={currentMonthTotalAmount}
        lastMonthLabel={lastMonthLabel}
        lastTotalAmount={lastMonthTotalAmount}
        comparisonLegend={comparisonLegend}
        insightText={monthlyInsight}
        canCreateBudget={totalBudget == null}
        isCreatingBudget={isBudgetSubmitting}
        onCreateBudget={handleCreateBudget}
      />
    </>
  );
}
