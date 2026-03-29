import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  AiCarouselPagination,
  AiFeatureCarouselCard,
} from '../../components/ai';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useAiFeatureCards, useAiFeatureCarousel, useResponsiveLayoutMode } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiFeedbackHomeScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiFeedbackHome'>) {
  const {
    mode,
    width: screenWidth,
    isCompact,
    isTall,
    pageHorizontal,
    sectionGap,
    scrollTopPadding,
    scrollBottomPadding,
  } = useResponsiveLayoutMode();
  const sessionUserId = useAuthStore((state) => state.user?.userId ?? null);
  const {
    status,
    resultData,
    startAnalysis,
    simulateAnalysis,
    refreshLatestAnalysis,
  } = useAiStore();
  const featureCards = useAiFeatureCards();
  const reportPeriod = resolveAiReportPeriod();
  const carouselPageWidth = Math.max(screenWidth - pageHorizontal * 2, 1);
  const carouselCardWidth = Math.min(
    carouselPageWidth,
    wp(isCompact ? 320 : isTall ? 348 : 336),
  );
  const { activeIndex, scrollRef, handleScroll, scrollToPage } = useAiFeatureCarousel({
    itemWidth: carouselPageWidth,
  });

  useFocusEffect(
    React.useCallback(() => {
      void refreshLatestAnalysis({
        year: reportPeriod.year,
        month: reportPeriod.month,
      });
    }, [refreshLatestAnalysis, reportPeriod.month, reportPeriod.year]),
  );

  const hasCurrentReport = React.useMemo(
    () =>
      matchesAiReportPeriod(resultData, reportPeriod, sessionUserId)
      && Boolean(resultData?.report),
    [reportPeriod, resultData, sessionUserId],
  );

  const titleStyle = {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(36),
  } as const;

  const highlightStyle = {
    color: COLORS.primary,
  } as const;

  const isAnalysisRunning = status === 'loading';
  const buttonTitle =
    isAnalysisRunning
      ? 'AI 피드백 정리 중'
      : hasCurrentReport
        ? '이번 달 AI 피드백 보기'
        : 'AI 피드백 시작하기';

  return (
    <BottomTabScreenLayout
      containerStyle={{ flex: 1, backgroundColor: COLORS.backgroundSecondary }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: pageHorizontal }}
      scrollTopPadding={scrollTopPadding}
      scrollBottomPadding={isCompact ? scrollBottomPadding + hp(24) : scrollBottomPadding}
      backgroundColor={COLORS.backgroundSecondary}
    >
      <View
        style={{
          marginTop: isCompact ? hp(12) : isTall ? hp(24) : hp(20),
          marginBottom: sectionGap,
        }}
      >
        <Text style={titleStyle}>
          AI가 내 소비를 분석해{'\n'}
          <Text style={highlightStyle}>절약 포인트와 소비 유형</Text>
          {'\n'}
          을 알려드려요.
        </Text>
      </View>

      <View
        style={{
          marginBottom: sectionGap,
          width: '100%',
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          disableIntervalMomentum
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {featureCards.map((item) => (
            <View
              key={item.id}
              style={{
                width: carouselPageWidth,
                alignItems: 'center',
              }}
            >
              <AiFeatureCarouselCard
                title={item.title}
                description={item.description}
                layoutMode={mode}
                width={carouselCardWidth}
              >
                {item.preview}
              </AiFeatureCarouselCard>
            </View>
          ))}
        </ScrollView>
      </View>

      <AiCarouselPagination
        pageCount={featureCards.length}
        activeIndex={activeIndex}
        onPressPage={scrollToPage}
        compact={isCompact}
      />

      <View
        style={{
          paddingBottom: isCompact ? hp(8) : isTall ? hp(24) : hp(20),
          width: '100%',
        }}
      >
        <GradientButton
          title={buttonTitle}
          disabled={isAnalysisRunning}
          style={{ width: '100%' }}
          onPress={() => {
            if (hasCurrentReport) {
              navigation.navigate('AiResult');
              return;
            }

            if (!isAnalysisRunning) {
              startAnalysis({
                year: reportPeriod.year,
                month: reportPeriod.month,
              });
              simulateAnalysis({
                year: reportPeriod.year,
                month: reportPeriod.month,
              });
            }

            navigation.navigate('AiLoading');
          }}
        />
      </View>
    </BottomTabScreenLayout>
  );
}
