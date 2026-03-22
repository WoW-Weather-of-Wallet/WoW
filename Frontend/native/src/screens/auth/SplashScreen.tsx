import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { styles } from './SplashScreen.styles';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import {
  refreshSession,
  setNativeAuthToken,
} from '../../services/auth';
import {
  clearPersistedAuthSession,
  loadPersistedAuthSession,
  savePersistedAuthSession,
} from '../../services/sessionStorage';
import { useAuthStore } from '../../store/authStore';

// 스플래시 로고 이미지
const splashLogo = require('../../assets/splash.png');

/**
 * SplashScreen - 앱 시작 시 로고 애니메이션 화면
 *
 * 애니메이션 시퀀스:
 * 1. 로고 페이드인 + 스케일업 (0→1, 스프링)
 * 2. 잠시 유지
 * 3. 전체 페이드아웃 후 LoginScreen으로 전환
 */
export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  // 애니메이션 값
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const logoTranslateY = useSharedValue(30);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: 로고 페이드인 + 스케일업 + 슬라이드업
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

    // Step 2: 2.2초 유지 후 페이드아웃 효과
    screenOpacity.value = withDelay(
      2200,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) })
    );

    let isActive = true;

    const bootstrapSession = async () => {
      let nextRoute: 'Permission' | 'MainTabs' = 'Permission';
      const startedAt = Date.now();

      try {
        const persistedSession = await loadPersistedAuthSession();

        if (persistedSession?.autoLoginEnabled && persistedSession.refreshToken) {
          const refreshed = await refreshSession(persistedSession.refreshToken);

          if (!isActive) {
            return;
          }

          await savePersistedAuthSession({
            ...persistedSession,
            refreshToken: refreshed.refreshToken,
          });

          setNativeAuthToken(refreshed.accessToken);
          login({
            accessToken: refreshed.accessToken,
            user: persistedSession.user,
            autoLogin: true,
            source: 'restored',
          });
          nextRoute = 'MainTabs';
        }
      } catch (error) {
        console.warn('[Splash] session restore failed:', error);
        await clearPersistedAuthSession();
        logout();
        setNativeAuthToken(null);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 2500 - elapsed);

        setTimeout(() => {
          if (!isActive) {
            return;
          }

          navigation.replace(nextRoute);
        }, remaining);
      }
    };

    void bootstrapSession();

    return () => {
      isActive = false;
    };
  }, [login, logout, navigation]);

  // 로고 애니메이션 스타일
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  // 전체 화면 페이드아웃 스타일
  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.gradient}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={splashLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

