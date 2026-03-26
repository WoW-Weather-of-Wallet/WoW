import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface SecureKeypadProps {
  onPressNumber: (num: string) => void;
  onPressDelete: () => void;
}

export default function SecureKeypad({
  onPressNumber,
  onPressDelete,
}: SecureKeypadProps) {
  const [shuffledNumbers, setShuffledNumbers] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    shuffleKeypad();
  }, []);

  const shuffleKeypad = () => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    for (let index = numbers.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [numbers[index], numbers[randomIndex]] = [
        numbers[randomIndex],
        numbers[index],
      ];
    }

    setShuffledNumbers(numbers);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    shuffleKeypad();

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

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (shuffledNumbers.length === 0) return null;

  const renderCell = (index: number) => {
    if (index === 9) {
      return (
        <TouchableOpacity
          key="refresh"
          className="flex-1 items-center justify-center"
          style={{ height: hp(60) }}
          onPress={handleRefresh}
          activeOpacity={0.6}
          disabled={isRefreshing}
        >
          <Animated.View style={animatedIconStyle}>
            <Ionicons
              name="refresh-outline"
              size={wp(32)}
              color={COLORS.textPrimary}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }

    if (index === 11) {
      return (
        <TouchableOpacity
          key="delete"
          className="flex-1 items-center justify-center"
          style={{ height: hp(60) }}
          onPress={onPressDelete}
          activeOpacity={0.6}
        >
          <Ionicons
            name="backspace-outline"
            size={wp(32)}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      );
    }

    const number = index === 10 ? shuffledNumbers[9] : shuffledNumbers[index];

    return (
      <TouchableOpacity
        key={`num-${number}`}
        className="flex-1 items-center justify-center"
        style={{ height: hp(60) }}
        onPress={() => onPressNumber(number)}
        activeOpacity={0.6}
      >
        <Text
          style={{
            fontSize: fp(28),
            fontFamily: FONTS.semiBold,
            color: COLORS.textPrimary,
          }}
        >
          {number}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="w-full"
      style={{
        backgroundColor: COLORS.background,
        paddingVertical: hp(16),
      }}
    >
      <View className="flex-row justify-between" style={{ marginBottom: hp(16) }}>
        {[0, 1, 2].map(renderCell)}
      </View>
      <View className="flex-row justify-between" style={{ marginBottom: hp(16) }}>
        {[3, 4, 5].map(renderCell)}
      </View>
      <View className="flex-row justify-between" style={{ marginBottom: hp(16) }}>
        {[6, 7, 8].map(renderCell)}
      </View>
      <View className="flex-row justify-between">
        {[9, 10, 11].map(renderCell)}
      </View>
    </View>
  );
}
