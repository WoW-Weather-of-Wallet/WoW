import React from 'react';

import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import { HomeDashboardContent, HomeDashboardSheets } from '../../components/main';
import { COLORS } from '../../constants/theme';
import { useResponsiveLayoutMode } from '../../hooks';
import { useMainHomeFlow } from '../../hooks/useMainHomeFlow';
import { useModalState } from '../../hooks/useModalState';

export default function MainHomeScreen() {
  const {
    mode,
    pageHorizontal,
    sectionGap,
    scrollTopPadding,
    scrollBottomPadding,
  } = useResponsiveLayoutMode();
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const {
    weatherCard,
    spendingTypeCard,
    budgetReportCard,
    spendingTypeSheet,
    monthlyReportSheet,
  } = useMainHomeFlow({
    closeReportModal: reportModal.close,
  });

  return (
    <>
      <BottomTabScreenLayout
        containerStyle={styles.container}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: pageHorizontal,
        }}
        scrollTopPadding={scrollTopPadding}
        scrollBottomPadding={scrollBottomPadding}
      >
        <HomeDashboardContent
          weatherCard={weatherCard}
          spendingTypeCard={spendingTypeCard}
          budgetReportCard={budgetReportCard}
          onPressSpendingType={spendingTypeModal.open}
          onPressBudgetReport={reportModal.open}
          layoutMode={mode}
          sectionGap={sectionGap}
        />
      </BottomTabScreenLayout>

      <HomeDashboardSheets
        isSpendingTypeVisible={spendingTypeModal.visible}
        isReportVisible={reportModal.visible}
        spendingTypeSheet={spendingTypeSheet}
        monthlyReportSheet={monthlyReportSheet}
        onCloseSpendingType={spendingTypeModal.close}
        onCloseReport={reportModal.close}
      />
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
} as const;
