import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../../components/common/StepIndicator';
import { styles } from './WelcomeScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
import { login, registerSsafy } from '../../services/auth';
import { savePersistedAuthSession } from '../../services/sessionStorage';
import { useAuthStore } from '../../store/authStore';
import { extractApiErrorMessage } from '../../utils/error';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';

type WelcomeRouteParams = {
  signupMode?: 'normal' | 'ssafy';
  userId?: string;
  pendingToken?: string;
  pw?: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  phoneNumber?: string;
  // The backend now treats this as agreement to all active required terms.
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

  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    if (isSsafySignup) {
      if (!routeParams.pendingToken || !routeParams.birthDate || !routeParams.gender || !routeParams.phoneNumber) {
        Alert.alert('회원가입 정보 오류', 'SSAFY 회원가입 정보를 다시 확인해 주세요.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      setIsConfirming(true);
      try {
        const registerResponse = await registerSsafy({
          pendingToken: routeParams.pendingToken,
          phoneNumber: routeParams.phoneNumber,
          birthDate: routeParams.birthDate,
          gender: routeParams.gender,
          termsAgreed: routeParams.termsAgreed === true,
          alarmEnabled: routeParams.alarmEnabled !== false,
        });

        if (registerResponse.refreshToken) {
          await savePersistedAuthSession({
            refreshToken: registerResponse.refreshToken,
            user: registerResponse.user,
            autoLoginEnabled: true,
          });
        }

        loginToStore({
          accessToken: registerResponse.accessToken,
          user: registerResponse.user,
          autoLogin: true,
          source: 'ssafy',
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (error: any) {
        const presentation = buildAuthErrorPresentation(error, {
          flow: 'signup',
          fallbackMessage: 'SSAFY 회원가입 완료 중 문제가 발생했습니다. 다시 시도해 주세요.',
        });
        Alert.alert(presentation.title, presentation.alertMessage);
      } finally {
        setIsConfirming(false);
      }
      return;
    }

    if (!routeParams.userId || !routeParams.pw) {
      Alert.alert('자동 로그인 실패', '로그인 정보가 없어 다시 로그인해 주세요.');
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

      if (loginResponse.refreshToken) {
        await savePersistedAuthSession({
          refreshToken: loginResponse.refreshToken,
          user: loginResponse.user,
          autoLoginEnabled: true,
        });
      }

      loginToStore({
        accessToken: loginResponse.accessToken,
        user: loginResponse.user,
        autoLogin: true,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        '회원가입은 완료되었지만 자동 로그인에 실패했어요. 다시 로그인해 주세요.',
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
      <View style={styles.mainLayout}>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingTop: insets.top + hp(44) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={{ marginBottom: hp(16) }}>
              <StepIndicator currentStep={5} totalSteps={5} />
            </View>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={wp(84)} color={COLORS.primary} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.titleBlock}>
              <Text style={styles.title}>회원가입이 거의 끝났어요</Text>
              <Text style={styles.subtitle}>
                {routeParams.name ? `${routeParams.name}님의 정보를 확인해 주세요.` : '가입 정보를 확인해 주세요.'}
              </Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.infoSection}>
            <View style={styles.infoCard}>
              <InfoRow label={isSsafySignup ? '가입 방식' : '아이디'} value={isSsafySignup ? 'SSAFY' : routeParams.userId ?? '-'} />
              <InfoRow label="이름" value={routeParams.name ?? '-'} />
              <InfoRow label="생년월일" value={routeParams.birthDate ?? '-'} />
              <InfoRow
                label="성별"
                value={routeParams.gender === 'M' ? '남성' : routeParams.gender === 'F' ? '여성' : '-'}
              />
              <InfoRow label="휴대폰" value={routeParams.phoneNumber ?? '-'} />
              <InfoRow label="약관 동의" value={routeParams.termsAgreed ? '완료' : '미완료'} />
              <InfoRow label="알림" value={routeParams.alarmEnabled ? '사용' : '미사용'} />
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(380).duration(500)}
          style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}
        >
          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.confirmButtonDisabled]}
            onPress={() => void handleConfirm()}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color={COLORS.textInverse} />
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
