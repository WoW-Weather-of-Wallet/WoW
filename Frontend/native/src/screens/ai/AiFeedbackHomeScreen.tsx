import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, hp, wp } from '../../constants/theme';
import { styles } from './AiFeedbackHomeScreen.styles';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import GradientButton from '../../components/common/GradientButton';
import AiFeatureCarouselCard from '../../components/ai/AiFeatureCarouselCard';
import { useAiFeatureCards, useAiFeatureCarousel } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import type { AiFeedbackStackScreenProps } from '../../types';

export default function AiFeedbackHomeScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiFeedbackHome'>) {
  const { status, startAnalysis, simulateAnalysis } = useAiStore();
  const featureCards = useAiFeatureCards();
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
          {featureCards.map((item) => (
            <AiFeatureCarouselCard
              key={item.id}
              title={item.title}
              description={item.description}
            >
              {item.preview}
            </AiFeatureCarouselCard>
          ))}
        </ScrollView>
      </View>

      <View style={styles.paginationContainer}>
        {featureCards.map((item, index) => (
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
