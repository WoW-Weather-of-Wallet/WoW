import React, { useEffect } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
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

const AiNotification = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { showToast, hideToast } = useAiStore();

  const currentRoute = getActiveRouteName(navigation.getState());
  const isStayingInLoading = currentRoute === 'AiLoading';

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
      style={{
        position: 'absolute',
        left: wp(20),
        right: wp(20),
        top: insets.top + hp(12),
        zIndex: 9999,
      }}
    >
      <Pressable
        className="flex-row items-center"
        style={{
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
        }}
        onPress={handlePress}
      >
        <View
          className="items-center justify-center"
          style={{
            width: wp(36),
            height: wp(36),
            borderRadius: wp(18),
            backgroundColor: COLORS.primary,
            marginRight: wp(12),
          }}
        >
          <Ionicons name="sparkles" size={wp(20)} color={COLORS.white} />
        </View>

        <View className="flex-1">
          <Text
            style={{
              fontSize: wp(14),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(2),
            }}
          >
            AI 소비 분석 결과가 도착했어요!
          </Text>
          <Text
            style={{
              fontSize: wp(12),
              fontFamily: FONTS.regular,
              color: COLORS.textTertiary,
            }}
          >
            지금 바로 리포트를 확인해보세요.
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: COLORS.gray100,
            paddingHorizontal: wp(12),
            paddingVertical: hp(6),
            borderRadius: RADIUS.sm,
            marginHorizontal: wp(8),
          }}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: wp(12),
              fontFamily: FONTS.medium,
              color: COLORS.primary,
            }}
          >
            보기
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: wp(4) }} onPress={hideToast}>
          <Ionicons name="close" size={wp(18)} color={COLORS.gray400} />
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
};

export default AiNotification;
