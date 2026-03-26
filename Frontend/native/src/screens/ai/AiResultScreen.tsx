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
import type { AiFeedbackStackScreenProps } from '../../types';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const {
    reset,
    resultData,
    errorInfo,
    isRefreshing,
    refreshLatestAnalysis,
  } = useAiStore();

  const isStale = Boolean(
    resultData?.report
    && resultData.cacheExpiresAt
    && new Date(resultData.cacheExpiresAt).getTime() <= Date.now(),
  );

  const { displayName, title, buttonTitle, cards } = useAiResultSummary(resultData, {
    errorInfo,
    isRefreshing,
    isStale,
  });

  useFocusEffect(
    React.useCallback(() => {
      void refreshLatestAnalysis({
        fromPush: Boolean(useAiStore.getState().resultData?.fromPush),
      });
    }, [refreshLatestAnalysis]),
  );

  const handlePrimaryPress = () => {
    if (!resultData?.report && errorInfo?.canRetry) {
      void refreshLatestAnalysis({
        force: true,
        fromPush: Boolean(resultData?.fromPush),
      });
      return;
    }

    reset();
    navigation.navigate('AiFeedbackHome');
  };

  const showRetryButton = Boolean(resultData?.report && errorInfo?.canRetry && !isRefreshing);

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
                force: true,
                fromPush: Boolean(resultData?.fromPush),
              });
            }}
          />
        ) : null}

        <View>
          <GradientButton
            title={!resultData?.report && errorInfo?.canRetry ? '다시 불러오기' : buttonTitle}
            disabled={isRefreshing && !resultData?.report}
            onPress={handlePrimaryPress}
          />
        </View>
      </Animated.View>
    </BottomTabScreenLayout>
  );
}
