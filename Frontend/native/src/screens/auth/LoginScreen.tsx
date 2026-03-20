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

        const response = await exchangeSsafyToken(parsed.code);
        loginToStore({
          accessToken: response.accessToken,
          user: response.user,
          autoLogin,
        });
        navigation.replace('MainTabs');
      } catch (error: any) {
        handledSsafyUrlRef.current = null;
        const message = extractApiErrorMessage(
          error,
          'SSAFY 로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.',
        );
        setLoginError(message);
        Alert.alert('SSAFY 로그인 오류', message);
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
      const message = extractApiErrorMessage(
        error,
        '로그인에 실패했어요. 아이디와 비밀번호를 다시 확인해 주세요.',
      );
      setLoginError(message);
      Alert.alert('로그인 실패', message);
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
      setLoginError('');
      await Linking.openURL(getSsafyLoginUrl());
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        'SSAFY 로그인 페이지를 여는 중 문제가 발생했습니다.',
      );
      setLoginError(message);
      Alert.alert('SSAFY 로그인 오류', message);
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
            <Text style={styles.headerTitle}>로그인</Text>
            <View style={styles.headerLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(500).springify()}>
            <View style={styles.devEntryCard}>
              <Text style={styles.devEntryTitle}>개발용 빠른 진입</Text>
              <Text style={styles.devEntryDescription}>
                백엔드 로그인과 별개로 메인 화면 UI를 빠르게 확인할 때 사용합니다.
              </Text>
              <GradientButton
                title="TEST: 메인 화면 바로가기"
                onPress={() => {
                  loginWithDevBypass({ userId: 'dev-main-user', name: '개발자' });
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
              label="아이디"
              value={userId}
              onChangeText={(value) => {
                setUserId(value);
                setLoginError('');
              }}
              containerStyle={styles.inputSpacing}
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
              containerStyle={styles.inputSpacing}
              autoComplete="password"
            />

            {loginError.length > 0 && <Text style={styles.errorText}>{loginError}</Text>}

            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <GradientButton title="회원가입" onPress={handleSignup} variant="outline" />
              </View>
              <View style={styles.buttonGap} />
              <View style={styles.buttonHalf}>
                <GradientButton
                  title={isSubmitting ? '로그인 중...' : '로그인'}
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
              <Text style={styles.findAccountText}>아이디 / 비밀번호 찾기</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(450).duration(500).springify()}
            style={styles.autoLoginContainer}
          >
            <Text style={styles.autoLoginText}>자동 로그인</Text>
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
            <Text style={styles.dividerText}>또는</Text>
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
                <Text style={styles.ssafyButtonText}>SSAFY 계정으로 로그인</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
