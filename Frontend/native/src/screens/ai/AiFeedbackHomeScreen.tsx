import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp, hp } from '../../constants/theme';
import { styles } from './AiFeedbackHomeScreen.styles';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import { useAiStore } from '../../store/aiStore';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import DataSourceNotice from '../../components/common/DataSourceNotice';
import type { AiFeedbackStackScreenProps } from '../../types';

/**
 * [UI-Mini-Component] 실제 대시보드를 축소한 느낌의 분석 프리뷰
 */
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
          <View style={[styles.miniCategoryBarFill, { width: '70%', backgroundColor: COLORS.primary }]} />
        </View>
      </View>
      <View style={styles.miniCategoryRow}>
        <View style={[styles.miniCategoryDot, { backgroundColor: COLORS.chartBlue }]} />
        <View style={styles.miniCategoryBarBg}>
          <View style={[styles.miniCategoryBarFill, { width: '40%', backgroundColor: COLORS.chartBlue }]} />
        </View>
      </View>
    </View>
  </View>
);

/**
 * [UI-Mini-Component] 막대 그래프와 진행률을 활용한 목표 프리뷰
 */
const MiniGoalPreview = () => (
  <View style={styles.previewContainer}>
    <View style={styles.miniUICard}>
      <View style={styles.miniGoalTop}>
        <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
        <View style={styles.miniGoalAmount} />
      </View>
      <View style={styles.miniProgressBarOuter}>
        <View style={styles.miniProgressBarInner} />
        {/* 플래그(목표 깃발) */}
        <View style={styles.miniProgressFlag} />
      </View>
      <View style={styles.miniBarChartRow}>
        {[16, 14, 12, 18, 10, 8, 6].map((h, i) => (
          <View key={i} style={[styles.miniTrendBar, { height: hp(h), backgroundColor: i >= 4 ? COLORS.chartGreen : 'rgba(0,0,0,0.08)' }]} />
        ))}
      </View>
    </View>
  </View>
);

/**
 * [UI-Mini-Component] 밝고 깔끔한 알림 토스트 프리뷰
 */
const MiniNotifPreview = () => (
  <View style={styles.previewContainer}>
    <View style={styles.miniPhoneOutline}>
      <View style={styles.miniPhoneHeader}>
        <View style={styles.miniProfileBlob} />
        <View style={[styles.miniSkeletonLine, { width: wp(30) }]} />
      </View>
      <View style={[styles.miniSkeletonLine, { width: '100%', marginBottom: hp(6) }]} />
      <View style={[styles.miniSkeletonLine, { width: '80%', marginBottom: hp(6) }]} />
      <View style={[styles.miniSkeletonLine, { width: '60%' }]} />
      
      {/* 알림 토스트 (상단) */}
      <View style={styles.miniToast}>
        <View style={styles.miniToastIcon} />
        <View style={[styles.miniSkeletonLine, { flex: 1, height: hp(6), backgroundColor: 'rgba(0,0,0,0.04)' }]} />
      </View>
    </View>
  </View>
);

const CAROUSEL_DATA = [
  {
    id: 1,
    title: '지능형 소비 분석',
    desc: '가장 많이 지출한 항목과 평균 대비 비율을 AI가 정밀하게 분석해 드립니다.',
    renderPreview: () => <MiniAnalysisPreview />,
  },
  {
    id: 2,
    title: '나만의 절감 목표',
    desc: '소비 패턴에 맞춘 구체적인 절감 목표액과 실천 가능한 팁을 제안합니다.',
    renderPreview: () => <MiniGoalPreview />,
  },
  {
    id: 3,
    title: '분석 완료 알림',
    desc: '분석 중 화면을 떠나도 괜찮습니다. 완료되는 즉시 알림으로 알려드려요.',
    renderPreview: () => <MiniNotifPreview />,
  },
];

export default function AiFeedbackHomeScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiFeedbackHome'>) {
  const { status, startAnalysis, simulateAnalysis } = useAiStore();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / wp(310 + 16)); // 카드 너비 + 마진
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * wp(310 + 16), animated: true });
    setActiveIndex(index);
  };

  return (
    <BottomTabScreenLayout
      containerStyle={styles.container}
      contentContainerStyle={styles.scrollContent}
      scrollTopPadding={hp(20)}
      scrollBottomPadding={hp(24)}
      backgroundColor={COLORS.background}
    >
        {false && <DataSourceNotice
          type="mock"
          description="현재 AI 기능 소개와 예시 화면은 시뮬레이션용 mock 데이터와 예시 문구를 사용합니다."
          style={{ marginBottom: hp(16) }}
        />}
        <View style={styles.header}>
          <Text style={styles.title}>
            당신의 소비 습관을 분석하여{'\n'}
            <Text style={styles.highlight}>더 스마트한 금융 생활</Text>을{'\n'}
            돕습니다.
          </Text>
        </View>

        {/* [UI-Carousel] 기능 안내 카루셀 섹션 */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false} // snapToInterval을 위해 false
            snapToInterval={wp(310 + 16)}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {CAROUSEL_DATA.map((item) => (
              <View key={item.id} style={styles.featureCard}>
                <View style={styles.previewContainer}>
                  {item.renderPreview()}
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* [UI-Pagination] 페이지네이션 도트 */}
        <View style={styles.paginationContainer}>
          {CAROUSEL_DATA.map((_, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => scrollToPage(index)}
              style={[
                styles.paginationDot, 
                index === activeIndex && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>

        <View style={styles.bottomSection}>
          <GradientButton 
            title={status === 'loading' ? "분석 확인하기" : "피드백 시작하기"} 
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
