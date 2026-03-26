import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import SafeAreaHeaderLayout from '../../components/common/SafeAreaHeaderLayout';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useAccountRecoveryResult } from '../../hooks';

export default function AccountRecoveryResultScreen() {
  const insets = useSafeAreaInsets();
  const {
    userId,
    isSsafy,
    isLocal,
    isNone,
    isFail,
    title,
    subtitle,
    secondaryAction,
    mainAction,
    handleClose,
    handleSsafyLink,
  } = useAccountRecoveryResult();

  return (
    <SafeAreaHeaderLayout
      containerStyle={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
      backgroundColor={COLORS.background}
      headerContent={
        <View
          style={{
            height: hp(56),
            justifyContent: 'center',
            paddingHorizontal: wp(16),
          }}
        >
          <TouchableOpacity
            style={{ padding: wp(4) }}
            onPress={handleClose}
          >
            <Ionicons
              name="close"
              size={wp(28)}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View
        className="flex-1 items-center"
        style={{
          paddingHorizontal: wp(24),
          paddingTop: hp(40),
        }}
      >
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{ marginBottom: hp(32) }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: wp(100),
              height: wp(100),
              backgroundColor:
                isNone || isFail ? COLORS.gray100 : `${COLORS.primary}10`,
            }}
          >
            <Ionicons
              name={isNone || isFail ? 'search-outline' : 'person-circle'}
              size={wp(60)}
              color={isNone || isFail ? COLORS.textTertiary : COLORS.primary}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          className="items-center"
          style={{ marginBottom: hp(48) }}
        >
          <Text
            style={{
              fontSize: fp(24),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(8),
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: fp(24),
            }}
          >
            {subtitle}
          </Text>
        </Animated.View>

        {isLocal ? (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="w-full flex-row items-center justify-between"
            style={{
              backgroundColor: COLORS.gray50,
              borderRadius: RADIUS.xl,
              padding: wp(20),
            }}
          >
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              아이디
            </Text>
            <Text
              style={{
                fontSize: fp(20),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
              }}
            >
              {userId}
            </Text>
          </Animated.View>
        ) : null}

        {isSsafy ? (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="w-full"
            style={{
              backgroundColor: COLORS.gray50,
              borderRadius: RADIUS.xl,
              padding: wp(24),
            }}
          >
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginBottom: hp(12),
              }}
            >
              이 계정은 <Text style={{ color: COLORS.primary }}>SSAFY 포털</Text>
              에서 확인할 수 있어요.
            </Text>
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
                lineHeight: fp(22),
                marginBottom: hp(20),
              }}
            >
              SSAFY 포털에서 아이디를 확인한 뒤 다시 로그인해 주세요.
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={handleSsafyLink}
            >
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary,
                  marginRight: wp(4),
                  textDecorationLine: 'underline',
                }}
              >
                SSAFY 포털 바로가기
              </Text>
              <Ionicons
                name="chevron-forward"
                size={wp(14)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        {isNone ? (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="w-full items-center"
          >
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: fp(24),
              }}
            >
              입력한 정보와 일치하는 계정을 찾을 수 없어요.
            </Text>
          </Animated.View>
        ) : null}

        {isFail ? (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="w-full items-center"
          >
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: fp(24),
              }}
            >
              본인인증에 실패했어요. 잠시 후 다시 시도해 주세요.
            </Text>
          </Animated.View>
        ) : null}

        <View
          className="mt-auto w-full"
          style={{ paddingBottom: Math.max(insets.bottom, hp(24)) }}
        >
          {secondaryAction ? (
            <TouchableOpacity
              className="flex-row items-center justify-center"
              style={{ marginBottom: hp(20), gap: wp(8) }}
              onPress={secondaryAction.onPress}
            >
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.medium,
                  color: COLORS.textSecondary,
                }}
              >
                {secondaryAction.description}
              </Text>
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.bold,
                  color: COLORS.primary,
                  textDecorationLine: 'underline',
                }}
              >
                {secondaryAction.linkLabel}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            className="items-center rounded-full"
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: hp(18),
              borderRadius: wp(30),
            }}
            onPress={mainAction.onPress}
          >
            <Text
              style={{
                fontSize: fp(18),
                fontFamily: FONTS.bold,
                color: COLORS.textInverse,
              }}
            >
              {mainAction.label}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaHeaderLayout>
  );
}
