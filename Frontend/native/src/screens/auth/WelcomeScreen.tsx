import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import StepIndicator from '../../components/common/StepIndicator';
import { styles } from './WelcomeScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
import { useWelcomeFlow } from '../../hooks';
import type { RootScreenProps } from '../../types';
import type { WelcomeRouteParams } from '../../types/auth';

export default function WelcomeScreen({
  route,
}: RootScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const routeParams = (route?.params ?? {}) as WelcomeRouteParams;
  const { isConfirming, isSsafySignup, handleConfirm } = useWelcomeFlow(routeParams);

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
              <Text style={styles.title}>회원가입이 완료되었어요</Text>
              <Text style={styles.subtitle}>
                {routeParams.name ? `${routeParams.name}님, 반가워요.` : '가입 정보를 확인해 주세요.'}
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
              <InfoRow label="휴대폰 번호" value={routeParams.phoneNumber ?? '-'} />
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
              <Text style={styles.confirmButtonText}>시작하기</Text>
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
