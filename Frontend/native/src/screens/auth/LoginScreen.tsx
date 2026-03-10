import React, { useState, useEffect } from 'react';
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
import { COLORS, FONTS, RADIUS, wp, hp, fp, SPACING } from '../../constants/theme';

/**
 * LoginScreen - 로그인 & 회원가입 화면
 */
export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  // 진입 애니메이션
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    headerOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    headerTranslateY.value = withDelay(
      100,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // 버튼 핸들러 (백엔드 미완성 → 콘솔 로그)
  const handleLogin = () => {
    console.log('로그인 시도:', { userId, password, autoLogin });
  };

  const handleSignup = () => {
    console.log('회원가입 페이지로 이동');
  };

  const handleFindAccount = () => {
    console.log('아이디/비밀번호 찾기');
  };

  const handleSSAFYLogin = () => {
    console.log('SSAFY 계정으로 로그인');
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 - 로그인 타이틀 */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <Text style={styles.headerTitle}>로그인</Text>
            <View style={styles.headerLine} />
          </Animated.View>

          {/* 입력 폼 영역 */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={styles.formContainer}
          >
            {/* 아이디 입력 */}
            <CustomTextInput
              label="아이디"
              value={userId}
              onChangeText={setUserId}
              containerStyle={styles.inputSpacing}
              autoComplete="username"
            />

            {/* 비밀번호 입력 */}
            <CustomTextInput
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              containerStyle={styles.inputSpacing}
              autoComplete="password"
            />

            {/* 회원가입 / 로그인 버튼 */}
            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <GradientButton
                  title="회원가입"
                  onPress={handleSignup}
                  variant="outline"
                />
              </View>
              <View style={styles.buttonGap} />
              <View style={styles.buttonHalf}>
                <GradientButton
                  title="로그인"
                  onPress={handleLogin}
                />
              </View>
            </View>
          </Animated.View>

          {/* 아이디/비밀번호 찾기 */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(500).springify()}
          >
            <TouchableOpacity
              onPress={handleFindAccount}
              style={styles.findAccountButton}
              activeOpacity={0.6}
            >
              <Text style={styles.findAccountText}>
                아이디 / 비밀번호 찾기
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 자동 로그인 토글 */}
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

          {/* 구분선 */}
          <Animated.View
            entering={FadeInDown.delay(550).duration(500).springify()}
            style={styles.dividerContainer}
          >
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* SSAFY 계정 로그인 */}
          <Animated.View
            entering={FadeInDown.delay(650).duration(500).springify()}
          >
            <TouchableOpacity
              onPress={handleSSAFYLogin}
              style={styles.ssafyButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ssafyGradient}
              >
                <Text style={styles.ssafyButtonText}>
                  SSAFY 계정으로 로그인
                </Text>
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

  // 헤더
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp(48),
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

  // 폼
  formContainer: {
    marginBottom: hp(8),
  },
  inputSpacing: {
    marginBottom: hp(14),
  },

  // 버튼 행
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

  // 아이디/비밀번호 찾기
  findAccountButton: {
    alignItems: 'center',
    paddingVertical: hp(16),
  },
  findAccountText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  // 자동 로그인
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

  // 구분선
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

  // SSAFY 버튼
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
