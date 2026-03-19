import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import GradientButton from '../../components/common/GradientButton';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function AiFeedbackHomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  /**
   * [UX-Design] 중앙 시각적 요소의 펄스(Pulse) 애니메이션을 설정합니다.
   * 로봇 대신 반짝이는 효과를 통해 AI의 지능적인 느낌을 강조합니다.
   */
  const pulseVal = useSharedValue(1);

  React.useEffect(() => {
    pulseVal.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseVal.value }],
    opacity: 0.3 / pulseVal.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: insets.top + hp(20), 
            // [UI-Fix] 4칸 탭 바(높이 hp(58) + insets.bottom)에 버튼이 가려지지 않도록 패딩 조정
            paddingBottom: insets.bottom + hp(80) 
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            당신의 소비 습관을 분석하여{'\n'}
            <Text style={styles.highlight}>더 스마트한 금융 생활</Text>을{'\n'}
            돕습니다.
          </Text>
        </View>

        <View style={styles.visualSection}>
          <View style={styles.glassCard}>
            <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
            <Animated.View style={[styles.pulseCircle, { width: wp(160), height: wp(160), borderRadius: wp(80) }, animatedPulseStyle]} />
            
            <View style={styles.iconContainer}>
              <Ionicons 
                name="sparkles" 
                size={wp(80)} 
                color={COLORS.primary} 
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <GradientButton 
            title="피드백 시작하기" 
            onPress={() => {
              // [UX-Flow] 로딩 시퀀스 화면으로 진입합니다.
              navigation.navigate('AiLoading');
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
