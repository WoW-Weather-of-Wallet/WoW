import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { COLORS, hp } from '../../constants/theme';
import { styles } from './MainHomeScreen.styles';
import { useModalState } from '../../hooks/useModalState';
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
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((state) => state.accessToken);
  const tabBarHeight = useBottomTabBarHeight();
  const reportModal = useModalState();
  const spendingTypeModal = useModalState();
  const [liveHeader, setLiveHeader] = React.useState<CalendarHeaderResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const monthLabel = `${today.getMonth() + 1}월`;

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: tabBarHeight + hp(30),
          },
        ]}
        showsVerticalScrollIndicator={false}
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
          userName="-"
          remainingBudget={null}
          budgetUsageRate={null}
          spentAmount={null}
          totalBudget={null}
          forecastText="-"
          onPress={reportModal.open}
        />
        {/* 카테고리별 소비는 실제 API 연결 전까지 화면에서 제외합니다. */}
        <HomeScheduleSection items={[]} />
      </ScrollView>

      <HomeSpendingTypeSheet visible={spendingTypeModal.visible} onClose={spendingTypeModal.close} />
      <HomeMonthlyReportSheet visible={reportModal.visible} onClose={reportModal.close} />
    </View>
  );
}
