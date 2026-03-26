import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import {
  HomeBudgetReportCard,
  HomeMonthlyReportSheet,
  HomeScheduleSection,
  HomeSpendingTypeCard,
  HomeSpendingTypeSheet,
  HomeTodayWeatherCard,
} from '../../components/main';
import { getCalendarHeader } from '../../services/calendar';
import { useAuthStore } from '../../store/authStore';
import type { CalendarHeaderResponse } from '../../types/calendar';

export default function MainHomeScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const sessionUserName = useAuthStore((state) => state.user?.name);
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const monthLabel = `${today.getMonth() + 1}월`;
  const trimmedUserName = sessionUserName?.trim();

  const loadHomeHeader = React.useCallback(async () => {
    if (!accessToken) {
      setLiveHeader(null);
      setIsWeatherLoading(false);
      return;
    }

    setIsWeatherLoading(true);

    try {
      const headerResponse = await getCalendarHeader({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      });

      setLiveHeader(headerResponse);
    } catch (error) {
      console.warn('Failed to load home calendar header from backend', error);
      setLiveHeader(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [accessToken, today]);

  useFocusEffect(
    React.useCallback(() => {
      void loadHomeHeader();
    }, [loadHomeHeader]),
  );

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
        <HomeSpendingTypeCard onPress={spendingTypeModal.open} />
        <HomeBudgetReportCard
          monthLabel={monthLabel}
          userName={trimmedUserName}
          remainingBudget={null}
          budgetUsageRate={null}
          spentAmount={null}
          totalBudget={null}
          forecastText={null}
          onPress={reportModal.open}
        />
        {/* 카테고리별 소비는 실제 API 연결 전까지 화면에서 제외합니다. */}
        <HomeScheduleSection items={[]} />
      </BottomTabScreenLayout>

      <HomeSpendingTypeSheet visible={spendingTypeModal.visible} onClose={spendingTypeModal.close} />
      <HomeMonthlyReportSheet visible={reportModal.visible} onClose={reportModal.close} />
    </>
  );
}
