import React, { useEffect, useRef, useState } from 'react';
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
  parseSsafyCallbackUrl,
} from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

WebBrowser.maybeCompleteAuthSession();

const LOGIN_ERROR_FALLBACK =
  '\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.';
const SSAFY_ERROR_FALLBACK =
  'SSAFY \uB85C\uADF8\uC778 \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.';

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

  useEffect(() => {
    const completeSsafyLogin = async (
      parsed:
        | { type: 'login'; code: string }
        | {
            type: 'login';
            accessToken: string;
            user?: {
              userId: string;
              name?: string;
              role?: string;
            };
          },
    ) => {
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
    };

    const handleSsafyCallback = async (url: string | null) => {
      if (!url || handledSsafyUrlRef.current === url) {
        return;
      }

      const parsed = parseSsafyCallbackUrl(url);
      if (!parsed) {
        return;
      }

      handledSsafyUrlRef.current = url;

      if (parsed.type === 'signup') {
        navigation.replace('PhoneAuth', {
          signupMode: 'ssafy',
          pendingToken: parsed.pendingToken,
          name: parsed.name,
        });
        return;
      }

      try {
        setIsSubmitting(true);
        setLoginError('');
        await completeSsafyLogin(parsed);
      } catch (error: any) {
        handledSsafyUrlRef.current = null;
        const message = extractApiErrorMessage(error, SSAFY_ERROR_FALLBACK);
        setLoginError(message);
        Alert.alert('SSAFY \uB85C\uADF8\uC778 \uC2E4\uD328', message);
      } finally {
        setIsSubmitting(false);
      }
    };

    Linking.getInitialURL().then((url) => {
      void handleSsafyCallback(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleSsafyCallback(url);
    });

    return () => subscription.remove();
  }, [autoLogin, loginToStore, navigation]);

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
      const message = extractApiErrorMessage(error, LOGIN_ERROR_FALLBACK);
      setLoginError(message);
      Alert.alert('\uB85C\uADF8\uC778 \uC2E4\uD328', message);
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

  const handleSsafyLoginResult = async (callbackUrl: string) => {
    const parsed = parseSsafyCallbackUrl(callbackUrl);
    if (!parsed) {
      return;
    }

    handledSsafyUrlRef.current = callbackUrl;

    if (parsed.type === 'signup') {
      navigation.replace('PhoneAuth', {
        signupMode: 'ssafy',
        pendingToken: parsed.pendingToken,
        name: parsed.name,
      });
      return;
    }

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
        await handleSsafyLoginResult(result.url);
      }
    } catch (error: any) {
      const message = extractApiErrorMessage(error, SSAFY_ERROR_FALLBACK);
      setLoginError(message);
      Alert.alert('SSAFY \uB85C\uADF8\uC778 \uC2E4\uD328', message);
    } finally {
      setIsSubmitting(false);
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
