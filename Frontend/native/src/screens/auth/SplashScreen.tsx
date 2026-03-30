import React, { useEffect } from 'react';
import { Image, StatusBar, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, wp } from '../../constants/theme';
import { useSplashBootstrap } from '../../hooks';

const splashLogo = require('../../assets/splash.png');

export default function SplashScreen() {
  useSplashBootstrap();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const logoTranslateY = useSharedValue(30);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    });

    logoTranslateY.value = withSpring(0, {
      damping: 14,
      stiffness: 90,
    });

    screenOpacity.value = withDelay(
      2200,
      withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.cubic),
      })
    );
  }, [logoOpacity, logoScale, logoTranslateY, screenOpacity]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
        },
        screenAnimatedStyle,
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <Animated.View
          className="items-center justify-center"
          style={logoAnimatedStyle}
        >
          <Image
            source={splashLogo}
            style={{ width: wp(200), height: wp(200) }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
