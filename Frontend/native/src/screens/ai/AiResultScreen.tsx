import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AiResultScreen.styles';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, hp, wp } from '../../constants/theme';
import { useAiStore } from '../../store/aiStore';
import type { AiFeedbackStackScreenProps } from '../../types';

export default function AiResultScreen({
  navigation,
}: AiFeedbackStackScreenProps<'AiResult'>) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { reset, resultData } = useAiStore();
  const userName = '-';
  const completedAt = resultData?.completedAt ?? '-';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: tabBarHeight + hp(40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.userName}>
            <Text style={styles.userNameHighlight}>{userName}</Text>
          </Text>
          <Text style={styles.title}>
            <Text style={styles.highlightExtraBold}>AI 분석 결과</Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>분석 상태</Text>
          <Text style={styles.clusterTitle}>-</Text>
          <Text style={styles.clusterDesc}>
            아직 연결된 분석 데이터가 없습니다.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>최근 분석 시각</Text>
          <Text style={styles.clusterTitle}>{completedAt}</Text>
          <Text style={styles.clusterDesc}>실제 분석 결과가 오기 전까지는 값이 표시되지 않습니다.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>카테고리별 분석</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="analytics-outline" size={wp(20)} color={COLORS.primary} />
            <Text style={[styles.clusterDesc, { marginLeft: wp(8) }]}>-</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>피드백</Text>
          <Text style={styles.clusterDesc}>
            데이터가 없으면 결과 대신 '-'로 표시합니다.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.bottomSection}>
          <GradientButton
            title="다시 보기"
            onPress={() => {
              reset();
              navigation.navigate('AiFeedbackHome');
            }}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
