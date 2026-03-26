import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import CustomTextInput from '../../components/common/CustomTextInput';
import GradientButton from '../../components/common/GradientButton';
import SafeAreaScrollLayout from '../../components/common/SafeAreaScrollLayout';
import { COLORS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useLoginFlow } from '../../hooks';
import type { RootScreenProps } from '../../types';

const loginLayoutStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: wp(28),
    paddingTop: hp(36),
    paddingBottom: hp(24),
  },
  headerContainer: {
    alignItems: 'center' as const,
    marginBottom: hp(28),
  },
  headerTitle: {
    fontSize: fp(28),
    letterSpacing: -0.5,
  },
  headerLine: {
    width: wp(40),
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: hp(12),
  },
  formContainer: {
    marginBottom: hp(8),
  },
  inputSpacing: {
    marginBottom: hp(14),
  },
  errorText: {
    fontSize: fp(13),
    lineHeight: fp(19),
    color: COLORS.error,
    marginBottom: hp(10),
  },
  buttonRow: {
    flexDirection: 'row' as const,
    marginTop: hp(8),
  },
  buttonGap: {
    width: wp(12),
  },
  loadingRow: {
    alignItems: 'center' as const,
    marginTop: hp(14),
  },
  findAccountButton: {
    alignItems: 'center' as const,
    paddingVertical: hp(16),
  },
  findAccountText: {
    fontSize: fp(14),
  },
  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: hp(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: wp(16),
    fontSize: fp(13),
  },
  ssafyButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden' as const,
  },
  ssafyGradient: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: hp(18),
    borderRadius: RADIUS.xl,
  },
  ssafyButtonText: {
    fontSize: fp(16),
    letterSpacing: 0.3,
  },
} as const;

const buildFadeInDown = (delay: number) =>
  FadeInDown.delay(delay).duration(500).springify();

export default function LoginScreen({ navigation }: RootScreenProps<'Login'>) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const {
    isSubmitting,
    loginError,
    clearLoginError,
    handleLogin,
    handleSsafyLoginPress,
  } = useLoginFlow();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
    headerTranslateY.value = withDelay(
      100,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
  }, [headerOpacity, headerTranslateY]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const handleSignup = () => {
    navigation.navigate('PhoneAuth');
  };

  const handleFindAccount = () => {
    navigation.navigate('AccountRecoveryEntry');
  };

  return (
    <View className="flex-1" style={loginLayoutStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaScrollLayout
        containerStyle={loginLayoutStyles.keyboardView}
        scrollContentStyle={loginLayoutStyles.scrollContent}
        scrollTopPadding={0}
        scrollBottomPadding={hp(32)}
        scrollBottomMinPadding={hp(16)}
        includeTopInset
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(20) : 0}
      >
        <Animated.View style={[loginLayoutStyles.headerContainer, headerAnimatedStyle]}>
          <Text
            className="font-sans-bold text-text"
            style={loginLayoutStyles.headerTitle}
          >
            로그인
          </Text>
          <View style={loginLayoutStyles.headerLine} />
        </Animated.View>

        <Animated.View
          entering={buildFadeInDown(200)}
          style={loginLayoutStyles.formContainer}
        >
          <CustomTextInput
            label="아이디"
            value={userId}
            onChangeText={(value) => {
              setUserId(value);
              clearLoginError();
            }}
            containerStyle={loginLayoutStyles.inputSpacing}
            autoComplete="username"
          />

          <CustomTextInput
            label="비밀번호"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearLoginError();
            }}
            secureTextEntry
            containerStyle={loginLayoutStyles.inputSpacing}
            autoComplete="password"
          />

          {loginError.length > 0 ? (
            <Text
              className="font-sans-medium"
              style={loginLayoutStyles.errorText}
            >
              {loginError}
            </Text>
          ) : null}

          <View style={loginLayoutStyles.buttonRow}>
            <View className="flex-1">
              <GradientButton
                title="회원가입"
                onPress={handleSignup}
                variant="outline"
              />
            </View>
            <View style={loginLayoutStyles.buttonGap} />
            <View className="flex-1">
              <GradientButton
                title={isSubmitting ? '로그인 중...' : '로그인'}
                onPress={() => void handleLogin({ userId, password })}
              />
            </View>
          </View>

          {isSubmitting ? (
            <View className="items-center" style={loginLayoutStyles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={buildFadeInDown(350)}>
          <TouchableOpacity
            onPress={handleFindAccount}
            style={loginLayoutStyles.findAccountButton}
            activeOpacity={0.6}
          >
            <Text
              className="font-sans-medium text-text-secondary"
              style={loginLayoutStyles.findAccountText}
            >
              아이디 / 비밀번호 찾기
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={buildFadeInDown(450)}
          style={loginLayoutStyles.dividerContainer}
        >
          <View style={loginLayoutStyles.dividerLine} />
          <Text
            className="font-sans text-text-tertiary"
            style={loginLayoutStyles.dividerText}
          >
            또는
          </Text>
          <View style={loginLayoutStyles.dividerLine} />
        </Animated.View>

        <Animated.View entering={buildFadeInDown(550)}>
          <TouchableOpacity
            onPress={() => void handleSsafyLoginPress()}
            style={loginLayoutStyles.ssafyButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.blue500, COLORS.blue600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={loginLayoutStyles.ssafyGradient}
            >
              <Text
                className="font-sans-semibold text-text-inverse"
                style={loginLayoutStyles.ssafyButtonText}
              >
                SSAFY 계정으로 로그인
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaScrollLayout>
    </View>
  );
}
