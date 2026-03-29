import React from 'react';
import { ScrollView, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AiResultSummaryCard, AiStackHeader, buildAiStackHeaderTitle } from '../../components/ai';
import BottomTabOverlayLayout from '../../components/common/BottomTabOverlayLayout';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, LAYOUT, RADIUS, wp } from '../../constants/theme';
import { useAiResultSummary, useResponsiveLayoutMode } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    isCompact,
    pageHorizontal,
    scrollTopPadding,
    scrollBottomPadding,
  } = useResponsiveLayoutMode();
  const sessionUserId = useAuthStore((state) => state.user?.userId ?? null);
  const sessionUserName = useAuthStore((state) => state.user?.name ?? null);
  const reportPeriod = resolveAiReportPeriod();
  const refreshKey = `${sessionUserId ?? 'guest'}:${reportPeriod.year}:${reportPeriod.month}`;
  const contentLayoutMode = isCompact ? 'compact' : 'regular';
  const [bottomActionHeight, setBottomActionHeight] = React.useState(0);
  const headerHeight = 40;
  const headerBottomSpacing = isCompact ? 14 : 16;
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

  const { cards } = useAiResultSummary(currentPeriodResultData, {
    errorInfo,
    isRefreshing,
    isStale: false,
  });
  const headerTitle = buildAiStackHeaderTitle(sessionUserName, reportPeriod.month);
  const refreshAttemptedKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (currentPeriodResultData?.report || isRefreshing) {
      return;
    }

    if (refreshAttemptedKeyRef.current === refreshKey) {
      return;
    }

    refreshAttemptedKeyRef.current = refreshKey;
    void refreshLatestAnalysis({
      year: reportPeriod.year,
      month: reportPeriod.month,
      fromPush: Boolean(useAiStore.getState().resultData?.fromPush),
    });
  }, [
    currentPeriodResultData?.report,
    isRefreshing,
    refreshKey,
    refreshLatestAnalysis,
    reportPeriod.month,
    reportPeriod.year,
  ]);

  const showRetryButton = Boolean(
    currentPeriodResultData?.report && errorInfo?.canRetry && !isRefreshing,
  );

  const retryButtonTitle = isRefreshing
    ? 'AI 피드백 다시 불러오는 중'
    : 'AI 피드백 다시 불러오기';

  return (
    <BottomTabOverlayLayout
      containerStyle={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}
      backgroundColor={COLORS.backgroundSecondary}
      contentContainerStyle={{ flex: 1 }}
      topOverlayTopPadding={scrollTopPadding}
      topOverlayStyle={{
        paddingHorizontal: pageHorizontal,
        paddingBottom: headerBottomSpacing,
        backgroundColor: COLORS.backgroundSecondary,
        zIndex: 2,
      }}
      topOverlayContent={
        <AiStackHeader
          title={headerTitle}
          showBackButton
          onPressBack={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }

            navigation.navigate('AiFeedbackHome');
          }}
        />
      }
      bottomOverlayStyle={showRetryButton ? { paddingHorizontal: pageHorizontal } : undefined}
      bottomOverlayBottomPadding={isCompact ? 10 : 14}
      bottomOverlayContent={showRetryButton ? (
        <View
          onLayout={(event) => {
            const nextHeight = Math.ceil(event.nativeEvent.layout.height);
            if (Math.abs(nextHeight - bottomActionHeight) > 2) {
              setBottomActionHeight(nextHeight);
            }
          }}
          style={{
            gap: isCompact ? 10 : 12,
            paddingTop: 0,
            paddingHorizontal: 0,
            paddingBottom: 0,
            borderRadius: RADIUS.xxl,
            backgroundColor: COLORS.backgroundSecondary,
            borderWidth: 1,
            borderColor: COLORS.surfaceBorder,
            shadowColor: COLORS.textPrimary,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              gap: isCompact ? 10 : 12,
              padding: wp(isCompact ? 14 : 16),
              borderRadius: RADIUS.xxl,
              backgroundColor: COLORS.background,
            }}
          >
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
          </View>
        </View>
      ) : null}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: pageHorizontal,
          paddingTop: insets.top + scrollTopPadding + headerHeight + headerBottomSpacing,
          paddingBottom: bottomActionHeight + tabBarHeight + scrollBottomPadding + 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: isCompact ? LAYOUT.pageSectionGapCompact + 2 : LAYOUT.pageSectionGap }}>
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
