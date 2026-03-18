import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  mockHomeInsights,
  mockHomeSummary,
  mockScheduleItems,
  mockSpendingCategories,
} from '../../mock/dashboard';
import { mockHomeCalendarPreview } from '../../mock/calendar';
import { COLORS, hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
import {
  HomeBudgetReportCard,
  HomeCategorySection,
  HomeInsightSection,
  HomeMonthlyReportSheet,
  HomeScheduleSection,
  HomeSpendingTypeCard,
  HomeSpendingTypeSheet,
  HomeWeeklyPreviewCard,
} from '../../components/main';

// 메인 홈 화면은 데이터를 조합하고 섹션 컴포넌트를 배치하는 역할만 담당합니다.
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundSecondary}
      />

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: insets.bottom + hp(130),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeSpendingTypeCard onPress={spendingTypeModal.open} />
        <HomeWeeklyPreviewCard items={mockHomeCalendarPreview} />
        <HomeBudgetReportCard {...mockHomeSummary} onPress={reportModal.open} />
        <HomeInsightSection items={mockHomeInsights} />
        <HomeCategorySection items={mockSpendingCategories} />
        <HomeScheduleSection items={mockScheduleItems} />
      </ScrollView>

      <HomeSpendingTypeSheet
        visible={spendingTypeModal.visible}
        onClose={spendingTypeModal.close}
      />
      <HomeMonthlyReportSheet
        visible={reportModal.visible}
        onClose={reportModal.close}
      />
    </View>
  );
}


