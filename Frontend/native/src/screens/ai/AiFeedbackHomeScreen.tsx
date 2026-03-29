import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  AiCarouselPagination,
  AiFeatureCarouselCard,
} from '../../components/ai';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, FONTS, LAYOUT, fp, hp, wp } from '../../constants/theme';
import { useAiFeatureCards, useAiFeatureCarousel } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import type { AiFeedbackStackScreenProps } from '../../types';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../../utils/aiReportPeriod';

export default function AiFeedbackHomeScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiFeedbackHome'>) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
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
  const isCompactHeight = screenHeight < 760;
  const horizontalPadding = isCompactHeight ? wp(16) : LAYOUT.pageHorizontal;
  const carouselPageWidth = Math.max(screenWidth - horizontalPadding * 2, 1);
  const carouselCardWidth = Math.min(carouselPageWidth, wp(isCompactHeight ? 320 : 336));
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
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: horizontalPadding }}
      scrollTopPadding={isCompactHeight ? hp(12) : hp(20)}
      scrollBottomPadding={isCompactHeight ? hp(56) : hp(28)}
      backgroundColor={COLORS.backgroundSecondary}
    >
      <View
        style={{
          marginTop: isCompactHeight ? hp(12) : hp(20),
          marginBottom: isCompactHeight ? hp(16) : LAYOUT.pageSectionGap,
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
          marginBottom: isCompactHeight ? hp(16) : LAYOUT.pageSectionGap,
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
                compact={isCompactHeight}
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
        compact={isCompactHeight}
      />

      <View
        style={{
          paddingBottom: isCompactHeight ? hp(8) : hp(20),
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
