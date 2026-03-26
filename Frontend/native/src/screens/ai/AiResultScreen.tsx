import React from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { styles } from './AiResultScreen.styles';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, hp } from '../../constants/theme';
import BottomTabScreenLayout from '../../components/common/BottomTabScreenLayout';
import { AiResultSummaryCard } from '../../components/ai';
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
      containerStyle={styles.container}
      contentContainerStyle={styles.scrollContent}
      scrollTopPadding={20}
      scrollBottomPadding={hp(40)}
      backgroundColor={COLORS.background}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.userName}>
          <Text style={styles.userNameHighlight}>{displayName}</Text>
        </Text>
        <Text style={styles.title}>
          <Text style={styles.highlightExtraBold}>{title}</Text>
        </Text>
      </Animated.View>

      {cards.map((card, index) => (
        <Animated.View
          key={card.id}
          entering={FadeInDown.delay((index + 1) * 100).duration(500)}
        >
          <AiResultSummaryCard {...card} />
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.bottomSection}>
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
