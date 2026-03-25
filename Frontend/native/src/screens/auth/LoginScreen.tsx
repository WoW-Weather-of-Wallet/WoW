import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import CustomTextInput from '../../components/common/CustomTextInput';
import GradientButton from '../../components/common/GradientButton';
import { useAuthStore } from '../../store/authStore';
import { COLORS, RADIUS, fp, hp, wp } from '../../constants/theme';
import {
  exchangeSsafyToken,
  getSsafyLoginUrl,
  login,
  type NativeSsafyCodeLoginResult,
  parseSsafyCallbackUrl,
} from '../../services/auth';
import { savePersistedAuthSession } from '../../services/sessionStorage';
import { extractApiErrorMessage } from '../../utils/error';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_ERROR_FALLBACK =
  '로그인에 실패했어요. 아이디와 비밀번호를 다시 확인해 주세요.';
const SSAFY_ERROR_FALLBACK =
  'SSAFY 로그인 처리에 실패했어요. 잠시 후 다시 시도해 주세요.';

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
    paddingHorizontal: wp(28),
    paddingTop: hp(80),
    paddingBottom: hp(40),
  },
  headerContainer: {
    alignItems: 'center' as const,
    marginBottom: hp(32),
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
};

const buildFadeInDown = (delay: number) =>
  FadeInDown.delay(delay).duration(500).springify();

const createBottomSpacerStyle = (bottomInset: number) => ({
  height: Math.max(bottomInset, hp(20)),
});

const buildLoginErrorPresentation = (
  error: unknown,
  mode: 'general' | 'ssafy',
) => {
  const fallbackMessage = mode === 'general' ? LOGIN_ERROR_FALLBACK : SSAFY_ERROR_FALLBACK;
  const message = extractApiErrorMessage(error, fallbackMessage);
  const apiError = error as
    | {
        message?: string;
        response?: {
          status?: number;
          data?: {
            errorMessage?: string;
          };
        };
      }
    | undefined;

  const status = apiError?.response?.status;
  const serverMessage = apiError?.response?.data?.errorMessage ?? message;
  const normalizedMessage = serverMessage.toLowerCase();

  // 수정 전 코드:
  // - 로그인 실패도 일반 문자열만 Alert로 띄워 원인별 다음 행동을 판단하기 어려웠습니다.
  //
  // 변경 이유:
  // - 일반 로그인과 SSAFY 로그인은 실패 원인이 다르므로
  //   사용자에게 다시 입력할지, 잠시 후 재시도할지, 서버 설정을 볼지 구분해서 안내합니다.
  if (mode === 'general' && status === 401) {
    return {
      title: '로그인 정보 확인',
      inlineMessage: '아이디 또는 비밀번호가 올바르지 않아요. 다시 확인해주세요.',
      alertMessage: '아이디 또는 비밀번호가 올바르지 않아요. 다시 확인해주세요.',
    };
  }

  if (mode === 'ssafy' && normalizedMessage.includes('취소')) {
    return {
      title: 'SSAFY 로그인 취소',
      inlineMessage: 'SSAFY 로그인을 취소했어요.',
      alertMessage: 'SSAFY 로그인을 취소했어요. 필요하면 다시 시도해주세요.',
    };
  }

  if (mode === 'ssafy' && /ssafy|oauth|token/.test(normalizedMessage)) {
    return {
      title: 'SSAFY 로그인 실패',
      inlineMessage: 'SSAFY 인증 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      alertMessage: 'SSAFY 인증 서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    };
  }

  if (status === 500) {
    return {
      title: mode === 'general' ? '로그인 처리 실패' : 'SSAFY 로그인 처리 실패',
      inlineMessage: '서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      alertMessage: '서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    };
  }

  return {
    title: mode === 'general' ? '로그인 실패' : 'SSAFY 로그인 실패',
    inlineMessage: message,
    alertMessage: message,
  };
};

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const loginToStore = useAuthStore((state) => state.login);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const autoLogin = true;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const handledSsafyUrlRef = useRef<string | null>(null);
  const processingSsafyUrlRef = useRef<string | null>(null);

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
  }, []);

  const completeSsafyLogin = useCallback(
    async (parsed: NativeSsafyCodeLoginResult) => {
      const response = await exchangeSsafyToken(parsed.code);
      if (response.refreshToken) {
        await savePersistedAuthSession({
          refreshToken: response.refreshToken,
          user: response.user,
          autoLoginEnabled: true,
          loginType: 'SSAFY',
        });
      }
      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
        source: 'ssafy',
        loginType: 'SSAFY',
      });
      navigation.replace('MainTabs');
    },
    [autoLogin, loginToStore, navigation],
  );

  const processSsafyCallbackUrl = useCallback(
    async (url: string | null) => {
      if (!url) {
        return false;
      }

      if (
        handledSsafyUrlRef.current === url ||
        processingSsafyUrlRef.current === url
      ) {
        return true;
      }

      const parsed = parseSsafyCallbackUrl(url);
      if (!parsed) {
        return false;
      }

      /*
       * 수정 전 코드:
       * - Linking 리스너용 handleSsafyCallback
       * - openAuthSessionAsync 성공 결과용 handleSsafyLoginResult
       * 위 두 함수가 같은 URL을 각각 처리했습니다.
       *
       * 변경 이유:
       * - 플랫폼에 따라 같은 SSAFY 콜백이 Linking 과 auth session 결과로 동시에 들어올 수 있습니다.
       * - 그러면 코드 교환이나 화면 이동이 두 번 실행될 가능성이 있어, URL 단위로 "처리 중" 상태를 함께 막아야 합니다.
       */
      processingSsafyUrlRef.current = url;

      try {
        setIsSubmitting(true);
        setLoginError('');

        if (parsed.type === 'signup') {
          navigation.replace('PhoneAuth', {
            signupMode: 'ssafy',
            pendingToken: parsed.pendingToken,
            name: parsed.name,
          });
          handledSsafyUrlRef.current = url;
          return true;
        }

        // 새 코드:
        // - SSAFY 로그인 완료 로직은 한 함수에서만 수행합니다.
        // - 같은 URL 이 한 번 더 들어오면 handled/processing ref 에서 바로 차단합니다.
        await completeSsafyLogin(parsed);
        handledSsafyUrlRef.current = url;
        return true;
      } catch (error: any) {
        handledSsafyUrlRef.current = null;
        const presentation = buildLoginErrorPresentation(error, 'ssafy');
        setLoginError(presentation.inlineMessage);
        Alert.alert(presentation.title, presentation.alertMessage);
        return true;
      } finally {
        if (processingSsafyUrlRef.current === url) {
          processingSsafyUrlRef.current = null;
        }
        setIsSubmitting(false);
      }
    },
    [completeSsafyLogin, navigation],
  );

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      void processSsafyCallbackUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void processSsafyCallbackUrl(url);
    });

    return () => subscription.remove();
  }, [processSsafyCallbackUrl]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      const response = await login({
        userId: userId.trim(),
        pw: password,
      });

      if (response.refreshToken) {
        await savePersistedAuthSession({
          refreshToken: response.refreshToken,
          user: response.user,
          autoLoginEnabled: true,
          loginType: 'NORMAL',
        });
      }

      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
        loginType: 'NORMAL',
      });

      navigation.replace('MainTabs');
    } catch (error: any) {
      const presentation = buildLoginErrorPresentation(error, 'general');
      setLoginError(presentation.inlineMessage);
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('PhoneAuth');
  };

  const handleFindAccount = () => {
    navigation.navigate('AccountRecoveryEntry');
  };

  const handleSSAFYLoginPress = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError('');

      const result = await WebBrowser.openAuthSessionAsync(getSsafyLoginUrl());

      if (result.type === 'success' && 'url' in result && result.url) {
        await processSsafyCallbackUrl(result.url);
      }
    } catch (error: any) {
      const presentation = buildLoginErrorPresentation(error, 'ssafy');
      setLoginError(presentation.inlineMessage);
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      if (!processingSsafyUrlRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View className="flex-1" style={loginLayoutStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginLayoutStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={loginLayoutStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                setLoginError('');
              }}
              containerStyle={loginLayoutStyles.inputSpacing}
              autoComplete="username"
            />

            <CustomTextInput
              label="비밀번호"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setLoginError('');
              }}
              secureTextEntry
              containerStyle={loginLayoutStyles.inputSpacing}
              autoComplete="password"
            />

            {loginError.length > 0 && (
              <Text
                className="font-sans-medium"
                style={loginLayoutStyles.errorText}
              >
                {loginError}
              </Text>
            )}

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
                  onPress={handleLogin}
                />
              </View>
            </View>

            {isSubmitting && (
              <View className="items-center" style={loginLayoutStyles.loadingRow}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            )}
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
              onPress={handleSSAFYLoginPress}
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

          <View style={createBottomSpacerStyle(insets.bottom)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
