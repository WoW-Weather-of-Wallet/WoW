import React from 'react';

import { hp } from '../../constants/theme';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import { HomeDashboardContent, HomeDashboardSheets } from '../../components/main';
import { useMainHomeFlow } from '../../hooks/useMainHomeFlow';
import { useModalState } from '../../hooks/useModalState';
import { styles } from './MainHomeScreen.styles';

export default function MainHomeScreen() {
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
        contentContainerStyle={styles.contentContainer}
        scrollTopPadding={hp(12)}
        scrollBottomPadding={hp(30)}
      >
        <HomeDashboardContent
          weatherCard={weatherCard}
          spendingTypeCard={spendingTypeCard}
          budgetReportCard={budgetReportCard}
          onPressSpendingType={spendingTypeModal.open}
          onPressBudgetReport={reportModal.open}
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
