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
import { COLORS, hp, wp } from '../../constants/theme';
import { login, registerSsafy } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { extractApiErrorMessage } from '../../utils/error';

type WelcomeRouteParams = {
  signupMode?: 'normal' | 'ssafy';
  userId?: string;
  ssafyOauthId?: string;
  pendingToken?: string;
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

  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      if (isSsafySignup) {
        if (
          !routeParams.pendingToken ||
          !routeParams.birthDate ||
          !routeParams.gender ||
          !routeParams.phoneNumber
        ) {
          throw new Error('SSAFY 가입 정보가 부족합니다. 다시 시도해주세요.');
        }

        const signupResponse = await registerSsafy({
          pendingToken: routeParams.pendingToken,
          birthDate: routeParams.birthDate,
          gender: routeParams.gender,
          phoneNumber: routeParams.phoneNumber,
          termsAgreed: routeParams.termsAgreed === true,
          alarmEnabled: routeParams.alarmEnabled === true,
        });

        loginToStore({
          accessToken: signupResponse.accessToken,
          user: signupResponse.user,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        return;
      }

      if (!routeParams.userId || !routeParams.pw) {
        Alert.alert('자동 로그인 실패', '로그인 정보가 없어 로그인 화면으로 이동합니다.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

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
        isSsafySignup
          ? 'SSAFY 회원가입 처리에 실패했습니다. 다시 시도해주세요.'
          : '자동 로그인에 실패했습니다. 다시 시도해주세요.',
      );

      Alert.alert(isSsafySignup ? 'SSAFY 회원가입 실패' : '자동 로그인 실패', message);
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

            <Animated.View
              entering={FadeInDown.delay(180).duration(500)}
              style={styles.titleBlock}
            >
              <Text style={styles.title}>회원가입 정보 확인</Text>
              <Text style={styles.subtitle}>
                {routeParams.name
                  ? `${routeParams.name}님의 가입 정보를 확인해주세요.`
                  : '가입 정보를 확인해주세요.'}
              </Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.infoSection}>
            <View style={styles.infoCard}>
              <InfoRow
                label={isSsafySignup ? 'SSAFY ID' : '아이디'}
                value={routeParams.ssafyOauthId ?? routeParams.userId ?? '-'}
              />
              <InfoRow label="이름" value={routeParams.name ?? '-'} />
              <InfoRow label="생년월일" value={routeParams.birthDate ?? '-'} />
              <InfoRow
                label="성별"
                value={
                  routeParams.gender === 'M'
                    ? '남성'
                    : routeParams.gender === 'F'
                      ? '여성'
                      : '-'
                }
              />
              <InfoRow label="휴대폰번호" value={routeParams.phoneNumber ?? '-'} />
              <InfoRow label="약관 동의" value={routeParams.termsAgreed ? '동의' : '미동의'} />
              <InfoRow label="알림 수신" value={routeParams.alarmEnabled ? '사용' : '미사용'} />
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
              <Text style={styles.confirmButtonText}>
                {isSsafySignup ? '회원가입 완료' : '확인'}
              </Text>
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
