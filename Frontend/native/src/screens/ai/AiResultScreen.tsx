import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, hp, wp } from '../../constants/theme';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import { AiResultHeader, AiResultSummaryCard } from '../../components/ai';
import { useAiResultSummary } from '../../hooks';
import { useAiStore } from '../../store/aiStore';
import type { AiFeedbackStackScreenProps } from '../../types';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const { reset, resultData } = useAiStore();
  const { displayName, title, buttonTitle, cards } = useAiResultSummary(resultData);

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
        style={{ marginTop: hp(10) }}
      >
        <GradientButton
          title={buttonTitle}
          onPress={() => {
            reset();
            navigation.navigate('AiFeedbackHome');
          }}
        />
      </Animated.View>
    </BottomTabScreenLayout>
  );
}
