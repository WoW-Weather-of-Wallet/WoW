import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from './AiFeedbackHomeScreen.styles';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import { useAiFeatureCarousel } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import AiFeatureCarouselCard from '../../components/ai/AiFeatureCarouselCard';
import type { AiFeedbackStackScreenProps } from '../../types';

const MiniAnalysisPreview = () => (
  <View style={styles.previewContainer}>
    <View style={styles.miniUICard}>
      <View style={[styles.miniSkeletonLine, { width: wp(40), marginTop: hp(4) }]} />
      <View style={styles.miniDonutWrapper}>
        <View style={styles.miniDonutBase} />
        <View style={styles.miniDonutActive} />
        <View style={styles.miniDonutCenterText} />
      </View>
      <View style={styles.miniCategoryRow}>
        <View style={[styles.miniCategoryDot, { backgroundColor: COLORS.primary }]} />
        <View style={styles.miniCategoryBarBg}>
          <View
            style={[
              styles.miniCategoryBarFill,
              { width: '70%', backgroundColor: COLORS.primary },
            ]}
          />
        </View>
      </View>
      <View style={styles.miniCategoryRow}>
        <View style={[styles.miniCategoryDot, { backgroundColor: COLORS.chartBlue }]} />
        <View style={styles.miniCategoryBarBg}>
          <View
            style={[
              styles.miniCategoryBarFill,
              { width: '40%', backgroundColor: COLORS.chartBlue },
            ]}
          />
        </View>
      </View>
    </View>
  </View>
);

const MiniGoalPreview = () => (
  <View style={styles.previewContainer}>
    <View style={styles.miniUICard}>
      <View style={styles.miniGoalTop}>
        <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
        <View style={styles.miniGoalAmount} />
      </View>
      <View style={styles.miniProgressBarOuter}>
        <View style={styles.miniProgressBarInner} />
        <View style={styles.miniProgressFlag} />
      </View>
      <View style={styles.miniBarChartRow}>
        {[16, 14, 12, 18, 10, 8, 6].map((height, index) => (
          <View
            key={index}
            style={[
              styles.miniTrendBar,
              {
                height: hp(height),
                backgroundColor: index >= 4 ? COLORS.chartGreen : 'rgba(0,0,0,0.08)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  </View>
);

const MiniNotificationPreview = () => (
  <View style={styles.previewContainer}>
    <View style={styles.miniPhoneOutline}>
      <View style={styles.miniPhoneHeader}>
        <View style={styles.miniProfileBlob} />
        <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
      </View>
      <View style={[styles.miniSkeletonLine, { width: '100%', marginBottom: hp(6) }]} />
      <View style={[styles.miniSkeletonLine, { width: '80%', marginBottom: hp(6) }]} />
      <View style={[styles.miniSkeletonLine, { width: '60%' }]} />

      <View style={styles.miniToast}>
        <View style={styles.miniToastIcon} />
        <View
          style={[
            styles.miniSkeletonLine,
            { flex: 1, height: hp(6), backgroundColor: 'rgba(0,0,0,0.04)' },
          ]}
        />
      </View>
    </View>
  </View>
);

const CAROUSEL_DATA = [
  {
    id: 1,
    title: '내 소비 분석',
    description:
      '이번 달 소비 패턴을 바탕으로 어떤 항목에 지출이 몰렸는지 한눈에 확인할 수 있어요.',
    renderPreview: () => <MiniAnalysisPreview />,
  },
  {
    id: 2,
    title: '예산 목표 추천',
    description:
      '현재 소비 흐름을 기준으로 무리 없는 예산 목표를 제안하고 절약 방향을 함께 보여줘요.',
    renderPreview: () => <MiniGoalPreview />,
  },
  {
    id: 3,
    title: '분석 완료 알림',
    description:
      '분석이 끝나면 알림으로 바로 안내해줘서 결과 화면까지 빠르게 이어서 확인할 수 있어요.',
    renderPreview: () => <MiniNotificationPreview />,
  },
];

export default function AiFeedbackHomeScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiFeedbackHome'>) {
  const { status, startAnalysis, simulateAnalysis } = useAiStore();
  const { activeIndex, scrollRef, handleScroll, scrollToPage } = useAiFeatureCarousel({
    itemWidth: wp(326),
  });

  return (
    <BottomTabScreenLayout
      containerStyle={styles.container}
      contentContainerStyle={styles.scrollContent}
      scrollTopPadding={hp(20)}
      scrollBottomPadding={hp(24)}
      backgroundColor={COLORS.background}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          AI가 소비 흐름을 분석하고{'\n'}
          <Text style={styles.highlight}>다음 절약 포인트를 먼저</Text>
          {'\n'}
          정리해드려요.
        </Text>
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={wp(326)}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {CAROUSEL_DATA.map((item) => (
            <AiFeatureCarouselCard
              key={item.id}
              title={item.title}
              description={item.description}
            >
              {item.renderPreview()}
            </AiFeatureCarouselCard>
          ))}
        </ScrollView>
      </View>

      <View style={styles.paginationContainer}>
        {CAROUSEL_DATA.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => scrollToPage(index)}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomSection}>
        <GradientButton
          title={status === 'loading' ? '분석 준비 중' : '분석 시작하기'}
          onPress={() => {
            if (status === 'idle' || status === 'error') {
              startAnalysis();
              simulateAnalysis();
            }

            navigation.navigate('AiLoading');
          }}
        />
      </View>
    </BottomTabScreenLayout>
  );
}
