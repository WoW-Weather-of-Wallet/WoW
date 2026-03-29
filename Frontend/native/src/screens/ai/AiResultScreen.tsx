import React from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AiResultHeader, AiResultSummaryCard } from '../../components/ai';
import BottomTabOverlayLayout from '../../components/common/BottomTabOverlayLayout';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';
import { useAiResultSummary, useResponsiveLayoutMode } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const {
    isCompact,
    pageHorizontal,
    scrollTopPadding,
    scrollBottomPadding,
  } = useResponsiveLayoutMode();
  const sessionUserId = useAuthStore((state) => state.user?.userId ?? null);
  const reportPeriod = resolveAiReportPeriod();
  const contentLayoutMode = isCompact ? 'compact' : 'regular';
  const [bottomActionHeight, setBottomActionHeight] = React.useState(hp(104));
  const {
    reset,
    resultData,
    errorInfo,
    isRefreshing,
    refreshLatestAnalysis,
  } = useAiStore();

  const currentPeriodResultData = React.useMemo(
    () =>
      matchesAiReportPeriod(resultData, reportPeriod, sessionUserId)
        ? resultData
        : null,
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

  const showRetryButton = Boolean(
    currentPeriodResultData?.report && errorInfo?.canRetry && !isRefreshing,
  );

  const retryButtonTitle = isRefreshing
    ? 'AI 피드백 다시 불러오는 중'
    : 'AI 피드백 다시 불러오기';
  const primaryButtonTitle =
    !currentPeriodResultData?.report && errorInfo?.canRetry
      ? '다시 시도하기'
      : buttonTitle;

  return (
    <BottomTabOverlayLayout
      containerStyle={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}
      backgroundColor={COLORS.backgroundSecondary}
      contentContainerStyle={{ flex: 1 }}
      bottomOverlayStyle={{ paddingHorizontal: pageHorizontal }}
      bottomOverlayBottomPadding={isCompact ? hp(10) : hp(14)}
      bottomOverlayContent={
        <View
          onLayout={(event) => {
            const nextHeight = Math.ceil(event.nativeEvent.layout.height);
            if (Math.abs(nextHeight - bottomActionHeight) > 2) {
              setBottomActionHeight(nextHeight);
            }
          }}
          style={{
            gap: isCompact ? hp(10) : hp(12),
            paddingTop: showRetryButton ? 0 : hp(12),
            paddingHorizontal: showRetryButton ? 0 : wp(2),
            paddingBottom: showRetryButton ? 0 : hp(2),
            borderRadius: RADIUS.xxl,
            backgroundColor: COLORS.backgroundSecondary,
            borderWidth: showRetryButton ? 1 : 0,
            borderColor: showRetryButton ? COLORS.surfaceBorder : 'transparent',
            shadowColor: showRetryButton ? COLORS.textPrimary : 'transparent',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: showRetryButton ? 0.04 : 0,
            shadowRadius: showRetryButton ? 12 : 0,
            elevation: showRetryButton ? 6 : 0,
          }}
        >
          <View
            style={{
              gap: isCompact ? hp(10) : hp(12),
              padding: showRetryButton ? wp(isCompact ? 14 : 16) : 0,
              borderRadius: RADIUS.xxl,
              backgroundColor: showRetryButton ? COLORS.background : 'transparent',
            }}
          >
            {showRetryButton ? (
              <GradientButton
                title={retryButtonTitle}
                variant="outline"
                disabled={isRefreshing}
                style={{ width: '100%' }}
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

            <GradientButton
              title={primaryButtonTitle}
              disabled={isRefreshing && !currentPeriodResultData?.report}
              style={{ width: '100%' }}
              onPress={handlePrimaryPress}
            />
          </View>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: pageHorizontal,
          paddingTop: scrollTopPadding + (isCompact ? hp(18) : hp(24)),
          paddingBottom: bottomActionHeight + scrollBottomPadding + hp(12),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: isCompact ? hp(16) : hp(18) }}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <AiResultHeader displayName={displayName} title={title} />
          </Animated.View>

          {cards.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={FadeInDown.delay((index + 1) * 100).duration(500)}
            >
              <AiResultSummaryCard {...card} layoutMode={contentLayoutMode} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </BottomTabOverlayLayout>
  );
}
