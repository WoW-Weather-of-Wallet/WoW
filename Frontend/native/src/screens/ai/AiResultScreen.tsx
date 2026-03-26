import React from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AiResultHeader, AiResultSummaryCard } from '../../components/ai';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, hp, wp } from '../../constants/theme';
import { useAiResultSummary } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const sessionUserId = useAuthStore((state) => state.user?.userId ?? null);
  const reportPeriod = resolveAiReportPeriod();
  const {
    reset,
    resultData,
    errorInfo,
    isRefreshing,
    refreshLatestAnalysis,
  } = useAiStore();

  const currentPeriodResultData = React.useMemo(
    () => (
      matchesAiReportPeriod(resultData, reportPeriod, sessionUserId)
        ? resultData
        : null
    ),
    [reportPeriod, resultData, sessionUserId],
  );

  const { displayName, title, buttonTitle, cards } = useAiResultSummary(currentPeriodResultData, {
    errorInfo,
    isRefreshing,
    isStale: false,
  });

  useFocusEffect(
    React.useCallback(() => {
      void refreshLatestAnalysis({
        year: reportPeriod.year,
        month: reportPeriod.month,
        fromPush: Boolean(useAiStore.getState().resultData?.fromPush),
      });
    }, [refreshLatestAnalysis, reportPeriod.month, reportPeriod.year]),
  );

  const handlePrimaryPress = () => {
    if (!currentPeriodResultData?.report && errorInfo?.canRetry) {
      void refreshLatestAnalysis({
        year: reportPeriod.year,
        month: reportPeriod.month,
        force: true,
        fromPush: Boolean(currentPeriodResultData?.fromPush),
      });
      return;
    }

    reset();
    navigation.navigate('AiFeedbackHome');
  };

  const showRetryButton = Boolean(currentPeriodResultData?.report && errorInfo?.canRetry && !isRefreshing);

  return (
    <BottomTabScreenLayout
      containerStyle={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: wp(20) }}
      scrollTopPadding={20}
      scrollBottomPadding={hp(40)}
      backgroundColor={COLORS.background}
    >
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={{ marginBottom: hp(32) }}
      >
        <AiResultHeader displayName={displayName} title={title} />
      </Animated.View>

      {cards.map((card, index) => (
        <Animated.View
          key={card.id}
          entering={FadeInDown.delay((index + 1) * 100).duration(500)}
        >
          <AiResultSummaryCard {...card} />
        </Animated.View>
      ))}

      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={{ marginTop: hp(10), gap: hp(12) }}
      >
        {showRetryButton ? (
          <GradientButton
            title={isRefreshing ? '최신 결과 확인 중' : '최신 결과 다시 불러오기'}
            variant="outline"
            disabled={isRefreshing}
            onPress={() => {
              void refreshLatestAnalysis({
                year: reportPeriod.year,
                month: reportPeriod.month,
                force: true,
                fromPush: Boolean(currentPeriodResultData?.fromPush),
              });
            }}
          />
        ) : null}

        <View>
          <GradientButton
            title={!currentPeriodResultData?.report && errorInfo?.canRetry ? '다시 불러오기' : buttonTitle}
            disabled={isRefreshing && !currentPeriodResultData?.report}
            onPress={handlePrimaryPress}
          />
        </View>
      </Animated.View>
    </BottomTabScreenLayout>
  );
}
