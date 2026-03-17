import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
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
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';
import { getSsafyLoginUrl, login, parseSsafyCallbackUrl } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

/**
 * LoginScreen
 * 실제 로그인 API 가 연결된 화면입니다.
 * 세션 저장과 Authorization 헤더 갱신은 authStore 에서 한 번에 처리하고,
 * 개발 중 빠른 화면 확인을 위한 테스트 진입 버튼은 그대로 유지합니다.
 */
export default function LoginScreen({ navigation }: any) {
  const loginToStore = useAuthStore((state) => state.login);
  const loginWithDevBypass = useAuthStore((state) => state.loginWithDevBypass);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

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
    /**
     * SSAFY 로그인 완료 후 앱 딥링크 처리
     * access token 이 포함된 경우 세션을 열고,
     * signupRequired 값에 따라 CreateAccount 또는 MainTabs로 분기합니다.
     */
    const handleSsafyCallback = (url: string | null) => {
      if (!url) {
        return;
      }

      const parsed = parseSsafyCallbackUrl(url);

      if (!parsed) {
        return;
      }

      loginToStore({
        accessToken: parsed.accessToken,
        user: parsed.user,
        autoLogin,
      });

      if (parsed.signupRequired) {
        navigation.replace('CreateAccount', {
          signupMode: 'ssafy',
          ssafyOauthId: parsed.user.userId,
          name: parsed.user.name,
          termsAgreed: true,
        });
        return;
      }

      navigation.replace('MainTabs');
    };

    Linking.getInitialURL().then(handleSsafyCallback);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleSsafyCallback(url);
    });

    return () => {
      subscription.remove();
    };
  }, [autoLogin, loginToStore, navigation]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  /**
   * 현재 백엔드는 userId / pw 필드명을 사용합니다.
   * 화면 state 와 요청 DTO 이름이 다르기 때문에 이 지점에서 명시적으로 매핑합니다.
   */
  const handleLogin = async () => {
    if (!userId.trim() || !password.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    /**
     * [Defense-Log] 백엔드 요청값 검증(P2) 부재에 대응
     * 로그인 시 아이디/비밀번호가 비어있는지 프론트엔드에서 먼저 체크합니다.
     */
    if (!userId.trim()) {
      setLoginError('아이디를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }
    if (!password.trim()) {
      setLoginError('비밀번호를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await login({
        userId: userId.trim(),
        pw: password,
      });

      // 로그인 성공 시 세션 상태와 Authorization 헤더를 authStore 한 곳에서 같이 동기화합니다.
      loginToStore({
        accessToken: response.accessToken,
        user: response.user,
        autoLogin,
      });

      // 현재는 스크린 트리를 완전히 갈아끼우기보다, 로그인 성공 시 메인 탭으로 명시적으로 이동합니다.
      navigation.replace('MainTabs');
    } catch (error: any) {
      // 로그인/회원가입/SMS 인증이 서로 다른 에러 필드명을 내려줘도
      // 화면 문구는 shared 헬퍼 한 곳에서 통일된 우선순위로 가져옵니다.
      const message = extractApiErrorMessage(
        error,
        '로그인에 실패했어요. 아이디와 비밀번호를 다시 확인해주세요.',
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
    navigation.navigate('AccountRecovery');
  };

  const handleSSAFYLogin = async () => {
    console.log('SSAFY OAuth 연결 예정');
  };

  /**
   * SSAFY 로그인 버튼 액션
   * 백엔드 OAuth 진입점을 열고, 이후 앱으로 돌아오는 딥링크는 useEffect 에서 처리합니다.
   */
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
            {/* 개발 중 메인 UI 를 바로 확인해야 할 때 쓰는 임시 진입입니다. */}
            <View style={styles.devEntryCard}>
              <Text style={styles.devEntryTitle}>개발용 빠른 진입</Text>
              <Text style={styles.devEntryDescription}>
                백엔드 로그인과 별개로 메인 화면 UI 를 빠르게 확인할 때 사용합니다.
              </Text>
              <GradientButton
                title="TEST: 메인 화면 바로가기"
                onPress={() => {
                  // 개발자 우회 진입도 실제 로그인과 같은 authStore 를 타게 해서 화면 분기를 일관되게 맞춥니다.
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
              thumbColor={autoLogin ? COLORS.primary : '#f4f3f4'}
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
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ssafyGradient}
              >
                <Text style={styles.ssafyButtonText}>SSAFY 계정으로 로그인</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    marginBottom: hp(32),
  },
  headerTitle: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerLine: {
    width: wp(40),
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: hp(12),
  },
  devEntryCard: {
    marginBottom: hp(18),
    padding: wp(16),
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary50,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  devEntryTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
    marginBottom: hp(6),
  },
  devEntryDescription: {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(12),
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
    fontFamily: FONTS.medium,
    color: '#EF4444',
    marginBottom: hp(10),
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: hp(8),
  },
  buttonHalf: {
    flex: 1,
  },
  buttonGap: {
    width: wp(12),
  },
  loadingRow: {
    alignItems: 'center',
    marginTop: hp(14),
  },
  findAccountButton: {
    alignItems: 'center',
    paddingVertical: hp(16),
  },
  findAccountText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  autoLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: hp(8),
    marginBottom: hp(16),
  },
  autoLoginText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginRight: wp(10),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: FONTS.regular,
    color: COLORS.textTertiary,
  },
  ssafyButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  ssafyGradient: {
    paddingVertical: hp(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  ssafyButtonText: {
    color: COLORS.textInverse,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
});
