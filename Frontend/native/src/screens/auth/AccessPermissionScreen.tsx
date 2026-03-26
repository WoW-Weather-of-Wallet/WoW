import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import PermissionCard from '../../components/auth/PermissionCard';
import GradientButton from '../../components/common/GradientButton';
import SafeAreaScrollLayout from '../../components/common/SafeAreaScrollLayout';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useAccessPermissionFlow } from '../../hooks';

export default function AccessPermissionScreen() {
  const {
    isRefreshing,
    refreshPermissionStates,
    requestAllPermissions,
    handleConfirm,
    handlePermissionPress,
    mandatoryPermissionCards,
    optionalPermissionCards,
    animatedRotationStyles,
    shouldShowRequestAllButton,
  } = useAccessPermissionFlow();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaScrollLayout
        containerStyle={{
          flex: 1,
          backgroundColor: COLORS.background,
          paddingHorizontal: wp(24),
        }}
        scrollContentStyle={{
          paddingBottom: hp(40),
        }}
        scrollTopPadding={0}
        scrollBottomPadding={hp(64)}
        keyboardAware={false}
        bounces={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={{
            marginTop: hp(40),
            marginBottom: hp(32),
          }}
        >
          <Text
            style={{
              fontSize: fp(26),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              lineHeight: fp(36),
              letterSpacing: -0.6,
            }}
          >
            서비스 이용에 필요한
          </Text>
          <Text
            style={{
              fontSize: fp(26),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              lineHeight: fp(36),
              letterSpacing: -0.6,
            }}
          >
            접근 권한을 확인해 주세요
          </Text>
          <Text
            style={{
              marginTop: hp(12),
              fontSize: fp(15),
              lineHeight: fp(22),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            원활한 서비스 이용을 위해 필요한 권한을 안내드리고 있어요.
            {'\n'}
            각 항목을 눌러 권한 상태를 확인할 수 있어요.
          </Text>
        </Animated.View>

        <View className="w-full">
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
              marginBottom: hp(12),
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            필수 접근 권한
          </Text>
          <View style={{ gap: hp(12) }}>
            {mandatoryPermissionCards.map(({ item, delay, state }) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(delay)
                  .duration(400)
                  .springify()}
              >
                <PermissionCard
                  item={item}
                  state={state}
                  onPress={handlePermissionPress}
                />
              </Animated.View>
            ))}
          </View>
        </View>

        <View className="w-full" style={{ marginTop: hp(24) }}>
          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
              marginBottom: hp(12),
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            선택 접근 권한
          </Text>
          <View style={{ gap: hp(12) }}>
            {optionalPermissionCards.map(({ item, delay, state }) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(delay)
                  .duration(400)
                  .springify()}
              >
                <PermissionCard
                  item={item}
                  state={state}
                  onPress={handlePermissionPress}
                />
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: hp(40) }}>
          <TouchableOpacity
            className="flex-row items-center justify-center"
            style={{ gap: wp(6), marginBottom: hp(24) }}
            onPress={() => void refreshPermissionStates()}
            disabled={isRefreshing}
            activeOpacity={0.6}
          >
            <Animated.View style={animatedRotationStyles}>
              <Ionicons
                name="refresh-outline"
                size={wp(16)}
                color={COLORS.primary}
              />
            </Animated.View>
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary,
              }}
            >
              권한 상태 새로고침
            </Text>
          </TouchableOpacity>

          <View style={{ gap: hp(12) }}>
            <GradientButton
              title="필수 권한 확인하고 시작하기"
              onPress={handleConfirm}
            />

            {shouldShowRequestAllButton ? (
              <TouchableOpacity
                onPress={() => void requestAllPermissions()}
                className="items-center justify-center"
                style={{ paddingVertical: hp(12) }}
              >
                <Text
                  style={{
                    fontSize: fp(14),
                    fontFamily: FONTS.medium,
                    color: COLORS.textTertiary,
                    textDecorationLine: 'underline',
                  }}
                >
                  권한 요청을 다시 진행하기
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </SafeAreaScrollLayout>
    </>
  );
}
