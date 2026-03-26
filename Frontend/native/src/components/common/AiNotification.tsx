import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  type NavigationState,
  type PartialState,
  useNavigation,
} from '@react-navigation/native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, hp, RADIUS, wp } from '../../constants/theme';
import { useAiStore } from '../../store/aiStore';
import type { RootNavigationProp } from '../../types';

const getActiveRouteName = (
  state?: NavigationState | PartialState<NavigationState>,
): string | undefined => {
  if (!state) {
    return undefined;
  }

  const currentRoute = state.routes[state.index ?? 0];

  if ('state' in currentRoute && currentRoute.state) {
    return getActiveRouteName(
      currentRoute.state as NavigationState | PartialState<NavigationState>,
    );
  }

  return currentRoute.name;
};

/**
 * AiNotification
 * 전역으로 표시되는 프리미엄 알림 토스트입니다.
 * 사용자가 로딩 화면을 벗어났을 때 분석 완료 소식을 부드럽게 알려줍니다.
 */
const AiNotification = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { showToast, hideToast } = useAiStore();

  // 현재 가장 안쪽에 열린 화면을 기준으로 토스트 노출 여부를 판단합니다.
  const currentRoute = getActiveRouteName(navigation.getState());
  const isStayingInLoading = currentRoute === 'AiLoading';

  // 5초 뒤 자동으로 닫힙니다.
  useEffect(() => {
    if (showToast && !isStayingInLoading) {
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast, isStayingInLoading, hideToast]);

  if (!showToast || isStayingInLoading) {
    return null;
  }

  const handlePress = () => {
    hideToast();
    navigation.navigate('MainTabs', {
      screen: 'AiFeedback',
      params: { screen: 'AiResult' },
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(600)}
      exiting={FadeOutUp.duration(400)}
      layout={Layout.springify()}
      style={[styles.container, { top: insets.top + hp(12) }]}
    >
      <Pressable style={styles.content} onPress={handlePress}>
        <View style={styles.iconWrapper}>
          <Ionicons name="sparkles" size={wp(20)} color={COLORS.white} />
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>AI 소비 분석 결과 도착!</Text>
          <Text style={styles.subtitle}>지금 바로 리포트를 확인해보세요.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
          <Text style={styles.buttonText}>보기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Ionicons name="close" size={wp(18)} color={COLORS.gray400} />
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: wp(20),
    right: wp(20),
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: wp(16),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  iconWrapper: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: wp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  subtitle: {
    fontSize: wp(12),
    fontFamily: FONTS.regular,
    color: COLORS.textTertiary,
  },
  button: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: RADIUS.sm,
    marginHorizontal: wp(8),
  },
  buttonText: {
    fontSize: wp(12),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  closeButton: {
    padding: wp(4),
  },
});

export default AiNotification;
