import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { styles } from './SecureKeypad.styles';

interface SecureKeypadProps {
  onPressNumber: (num: string) => void;
  onPressDelete: () => void;
}

export default function SecureKeypad({ onPressNumber, onPressDelete }: SecureKeypadProps) {
  const [shuffledNumbers, setShuffledNumbers] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotation = useSharedValue(0);

  // 화면 진입 시 숫자를 한 번만 섞습니다.
  // 원할 경우 입력될 때마다 섞을 수도 있지만, 사용 편의성을 위해 초기 1회 셔플합니다.
  useEffect(() => {
    shuffleKeypad();
  }, []);

  const shuffleKeypad = () => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setShuffledNumbers(numbers);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    // 즉시 번호 새롭게 섞기
    shuffleKeypad();

    // 360도 회전 애니메이션 (500ms 길이) 실행 후 다시 누를 수 있게 잠금 해제
    rotation.value = withTiming(
      rotation.value + 360, 
      { duration: 500, easing: Easing.inOut(Easing.ease) }, 
      (finished) => {
        if (finished) {
          runOnJS(setIsRefreshing)(false);
        }
      }
    );
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  if (shuffledNumbers.length === 0) return null;

  // 키패드 매핑
  // 0~8번 인덱스는 정규 위치
  // 9번은 마스코트
  // 10번은 남은 숫자 1개
  // 11번은 지우기
  const renderCell = (index: number) => {
    if (index === 9) {
      // 우하단(실제로는 좌하단 9번째 인덱스) - 새로고침 버튼
      return (
        <TouchableOpacity 
          style={styles.cell} 
          onPress={handleRefresh} 
          activeOpacity={0.6} 
          key="refresh"
          disabled={isRefreshing}
        >
          <Animated.View style={animatedIconStyle}>
            <Ionicons name="refresh-outline" size={wp(32)} color={COLORS.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
      );
    }
    if (index === 11) {
      // 우하단 지우기 버튼
      return (
        <TouchableOpacity style={styles.cell} onPress={onPressDelete} activeOpacity={0.6} key="delete">
          <Ionicons name="backspace-outline" size={wp(32)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      );
    }

    // 숫자 버튼
    const num = index === 10 ? shuffledNumbers[9] : shuffledNumbers[index];
    
    return (
      <TouchableOpacity 
        style={styles.cell} 
        onPress={() => onPressNumber(num)} 
        activeOpacity={0.6} 
        key={`num-${num}`}
      >
        <Text style={styles.numberText}>{num}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[0, 1, 2].map(renderCell)}
      </View>
      <View style={styles.row}>
        {[3, 4, 5].map(renderCell)}
      </View>
      <View style={styles.row}>
        {[6, 7, 8].map(renderCell)}
      </View>
      <View style={styles.row}>
        {[9, 10, 11].map(renderCell)}
      </View>
    </View>
  );
}


