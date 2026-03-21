import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Switch,
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
import { styles } from './LoginScreen.styles';
import { COLORS, hp } from '../../constants/theme';
import {
  exchangeSsafyToken,
  getSsafyLoginUrl,
  login,
  type NativeSsafyCodeLoginResult,
  type NativeSsafyDirectLoginResult,
  parseSsafyCallbackUrl,
} from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_ERROR_FALLBACK =
  '\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.';
const SSAFY_ERROR_FALLBACK =
  'SSAFY \uB85C\uADF8\uC778 \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.';

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
  const loginWithDevBypass = useAuthStore((state) => state.loginWithDevBypass);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
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
    async (parsed: NativeSsafyCodeLoginResult | NativeSsafyDirectLoginResult) => {
      if ('accessToken' in parsed) {
        loginToStore({
          accessToken: parsed.accessToken,
          user:
            parsed.user ?? {
              userId: 'ssafy-user',
            },
          autoLogin,
        });
        navigation.replace('MainTabs');
        return;
      }

      const response = await exchangeSsafyToken(parsed.code);
      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
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

      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <Text style={styles.headerTitle}>{'\uB85C\uADF8\uC778'}</Text>
            <View style={styles.headerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()}>
            <View style={styles.devEntryCard}>
              <Text style={styles.devEntryTitle}>{'\uAC1C\uBC1C\uC6A9 \uBE60\uB978 \uC9C4\uC785'}</Text>
              <Text style={styles.devEntryDescription}>
                {
                  '\uD14C\uC2A4\uD2B8 \uC911\uC5D0\uB9CC \uC0AC\uC6A9\uD558\uC138\uC694. \uC784\uC2DC UI \uD655\uC778\uC774\uB098 \uB85C\uCEEC \uD750\uB984 \uC810\uAC80\uC5D0 \uD65C\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.'
                }
              </Text>
              <GradientButton
                title={'TEST: \uAC1C\uBC1C \uACC4\uC815 \uBC14\uB85C \uC785\uC7A5'}
                onPress={() => {
                  loginWithDevBypass({
                    userId: 'dev-main-user',
                    name: '\uAC1C\uBC1C\uC6A9',
                  });
                  navigation.replace('MainTabs');
                }}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={styles.formContainer}
          >
            <CustomTextInput
              label={'\uC544\uC774\uB514'}
              value={userId}
              onChangeText={(value) => {
                setUserId(value);
                setLoginError('');
              }}
              containerStyle={styles.inputSpacing}
              autoComplete="username"
            />

            <CustomTextInput
              label={'\uBE44\uBC00\uBC88\uD638'}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setLoginError('');
              }}
              secureTextEntry
              containerStyle={styles.inputSpacing}
              autoComplete="password"
            />

            {loginError.length > 0 && <Text style={styles.errorText}>{loginError}</Text>}

            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <GradientButton
                  title={'\uD68C\uC6D0\uAC00\uC785'}
                  onPress={handleSignup}
                  variant="outline"
                />
              </View>
              <View style={styles.buttonGap} />
              <View style={styles.buttonHalf}>
                <GradientButton
                  title={
                    isSubmitting
                      ? '\uB85C\uADF8\uC778 \uC911...'
                      : '\uB85C\uADF8\uC778'
                  }
                  onPress={handleLogin}
                />
              </View>
            </View>

            {isSubmitting && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
            <TouchableOpacity
              onPress={handleFindAccount}
              style={styles.findAccountButton}
              activeOpacity={0.6}
            >
              <Text style={styles.findAccountText}>
                {'\uC544\uC774\uB514 / \uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(450).duration(500).springify()}
            style={styles.autoLoginContainer}
          >
            <Text style={styles.autoLoginText}>{'\uC790\uB3D9 \uB85C\uADF8\uC778'}</Text>
            <Switch
              value={autoLogin}
              onValueChange={setAutoLogin}
              trackColor={{
                false: COLORS.border,
                true: COLORS.primarySoft,
              }}
              thumbColor={autoLogin ? COLORS.primary : COLORS.switchThumbInactive}
              ios_backgroundColor={COLORS.border}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(550).duration(500).springify()}
            style={styles.dividerContainer}
          >
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{'\uB610\uB294'}</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(650).duration(500).springify()}>
            <TouchableOpacity
              onPress={handleSSAFYLoginPress}
              style={styles.ssafyButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.blue500, COLORS.blue600]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ssafyGradient}
              >
                <Text style={styles.ssafyButtonText}>
                  {'SSAFY \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
