import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { extractApiErrorMessage } from '../../utils/error';

type WelcomeRouteParams = {
  // CreateAccount 완료 후 Welcome 화면으로 넘기는 가입 정보 요약 데이터
  signupMode?: 'normal' | 'ssafy';
  userId?: string;
  ssafyOauthId?: string;
  pw?: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  termsAgreed?: boolean;
  alarmEnabled?: boolean;
};

export default function WelcomeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const loginToStore = useAuthStore((state) => state.login);
  const routeParams = (route?.params ?? {}) as WelcomeRouteParams;
  const signupMode = routeParams.signupMode === 'ssafy' ? 'ssafy' : 'normal';
  const isSsafySignup = signupMode === 'ssafy';
  const [isConfirming, setIsConfirming] = useState(false);

  // Welcome 확인 버튼 처리
  // 일반 회원가입은 POST /api/v1/auth/login 으로 자동 로그인 후 MainTabs로 이동한다.
  // SSAFY 회원가입은 이미 열린 세션을 그대로 사용해 MainTabs로 이동한다.
  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    if (isSsafySignup) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }

    if (!routeParams.userId || !routeParams.pw) {
      Alert.alert('자동 로그인 실패', '로그인 정보가 없어 다시 로그인해주세요.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    setIsConfirming(true);

    try {
      const loginResponse = await login({
        userId: routeParams.userId,
        pw: routeParams.pw,
      });

      loginToStore({
        accessToken: loginResponse.accessToken,
        user: loginResponse.user,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        '회원가입은 완료됐지만 자동 로그인에 실패했어요. 다시 로그인해주세요.',
      );

      Alert.alert('자동 로그인 실패', message);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.mainLayout,
          { paddingTop: insets.top + hp(44), paddingBottom: Math.max(insets.bottom, hp(24)) },
        ]}
      >
        <View style={styles.headerSection}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={wp(84)} color={COLORS.primary} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.titleBlock}>
            <Text style={styles.title}>회원가입이 완료되었어요</Text>
            <Text style={styles.subtitle}>
              {routeParams.name ? `${routeParams.name}님 정보를 확인해주세요.` : '가입 정보를 확인해주세요.'}
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.infoSection}>
          {/* 회원가입 완료 직후 확인해야 하는 핵심 가입 정보를 요약해서 보여준다. */}
          <View style={styles.infoCard}>
            <InfoRow
              label={isSsafySignup ? 'SSAFY ID' : '아이디'}
              value={routeParams.ssafyOauthId ?? routeParams.userId ?? '-'}
            />
            <InfoRow label="이름" value={routeParams.name ?? '-'} />
            <InfoRow label="생년월일" value={routeParams.birthDate ?? '-'} />
            <InfoRow
              label="성별"
              value={routeParams.gender === 'M' ? '남성' : routeParams.gender === 'F' ? '여성' : '-'}
            />
            <InfoRow label="휴대폰" value={routeParams.phoneNumber ?? '-'} />
            <InfoRow label="약관동의" value={routeParams.termsAgreed ? '완료' : '미완료'} />
            <InfoRow label="알림" value={routeParams.alarmEnabled ? '허용' : '미허용'} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).duration(500)} style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.confirmButtonDisabled]}
            onPress={() => void handleConfirm()}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>확인</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: wp(28),
  },
  headerSection: {
    alignItems: 'center',
    gap: hp(18),
  },
  iconContainer: {
    marginTop: hp(20),
  },
  titleBlock: {
    alignItems: 'center',
    gap: hp(10),
  },
  title: {
    fontSize: fp(30),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: wp(18),
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
    gap: hp(14),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    width: wp(92),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  infoValue: {
    flex: 1,
    fontSize: fp(17),
    fontFamily: FONTS.semiBold,
    color: '#1A1A1A',
  },
  bottomSection: {
    paddingBottom: hp(8),
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
