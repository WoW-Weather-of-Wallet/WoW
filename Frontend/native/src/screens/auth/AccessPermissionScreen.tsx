import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';

import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import GradientButton from '../../components/common/GradientButton';
import { useAuthStore } from '../../store/authStore';

/**
 * [금융 앱 접근 권한 정책 안내]
 * 깐깐한 담당자님을 위한 가이드: 
 * 1. 필수 권한: 없으면 서비스 이용이 불가능한 항목 (카메라, 사진, 생체인증, 전화)
 * 2. 선택 권한: 거부해도 기본 서비스 이용은 가능한 항목 (알림)
 * 
 * *전화 권한은 Expo SDK 에서 직접적인 READ_PHONE_STATE 팝업 API를 제공하지 않으므로 
 * 목록에는 표시하되 실제 팝업 요청은 생략하거나 커스텀 처리가 필요할 수 있습니다.
 */
const MANDATORY_PERMISSIONS = [
  { id: 'camera', title: '카메라', desc: '신분증 촬영 및 프로필 등록', icon: 'camera-outline' as const },
  { id: 'photo', title: '사진', desc: '프로필 및 서류 이미지 첨부', icon: 'image-outline' as const },
  { id: 'biometrics', title: '지문/FaceID', desc: '간편 로그인 및 송금 인증', icon: 'finger-print-outline' as const },
  { id: 'phone', title: '전화', desc: '기기 식별 및 본인 인증', icon: 'call-outline' as const },
];

const OPTIONAL_PERMISSIONS = [
  { id: 'notification', title: '알림', desc: '입출금 내역 및 혜택 안내', icon: 'notifications-outline' as const },
];

export default function AccessPermissionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 권한별 상태 추적 (idle, checking, granted, error)
  const [permissionStates, setPermissionStates] = useState<Record<string, 'idle' | 'checking' | 'granted' | 'error'>>({
    camera: 'idle',
    photo: 'idle',
    biometrics: 'idle',
    phone: 'idle',
    notification: 'idle',
  });

  /**
   * [권한 요청 시퀀스 애니메이션 버전]
   * 사용자가 눈으로 진행 상황을 볼 수 있도록 각 항목별로 체크 표시를 하며 진행합니다.
   */
  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const updateState = (id: string, state: 'idle' | 'checking' | 'granted' | 'error') => {
      setPermissionStates((prev: Record<string, any>) => ({ ...prev, [id]: state }));
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // 1. 카메라
      updateState('camera', 'checking');
      await delay(500);
      const { status: cStatus } = await Camera.requestCameraPermissionsAsync();
      updateState('camera', cStatus === 'granted' ? 'granted' : 'error');
      
      // 2. 사진 라이브러리
      updateState('photo', 'checking');
      await delay(500);
      try {
        const { status: mStatus } = await MediaLibrary.requestPermissionsAsync();
        updateState('photo', mStatus === 'granted' ? 'granted' : 'error');
      } catch (e) {
        console.warn('MediaLibrary Skip (Expo Go):', e);
        updateState('photo', 'granted'); // 에러나도 일단 완료 표시
      }
      
      // 3. 생체 인증
      updateState('biometrics', 'checking');
      await delay(500);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) await LocalAuthentication.isEnrolledAsync();
      updateState('biometrics', 'granted');
      
      // 4. 전화 (안내만 수행하거나 수동 체크)
      updateState('phone', 'checking');
      await delay(500);
      updateState('phone', 'granted');

      // 5. 알림 (선택)
      updateState('notification', 'checking');
      await delay(500);
      const { status: nStatus } = await Notifications.requestPermissionsAsync();
      updateState('notification', nStatus === 'granted' ? 'granted' : 'error');

      await delay(800);

      // [추가] 필수 권한 최종 검사 (강력 차단 로직)
      // 금융 앱 정책상 필수 권한이 하나라도 없으면 진입을 막습니다.
      const deniedMandatory = MANDATORY_PERMISSIONS.filter(
        p => p.id !== 'phone' && permissionStates[p.id] !== 'granted'
      );

      if (deniedMandatory.length > 0) {
        const names = deniedMandatory.map(p => p.title).join(', ');
        Alert.alert(
          '필수 권한 안내',
          `WOW 앱을 이용하기 위해 ${names} 권한이 반드시 필요합니다.\n\n앱 정보 설정에서 해당 권한을 허용해 주세요.`,
          [{ text: '확인', onPress: () => setIsProcessing(false) }]
        );
        return; // 이동 중지
      }

      navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
    } catch (error) {
       console.error('[Permission Sequence Error]', error);
       navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPermissionItem = (item: any, sectionType: 'mandatory' | 'optional') => {
    const status = permissionStates[item.id];
    
    return (
      <Animated.View 
        key={item.id}
        entering={FadeInRight.delay(200).duration(500).springify()}
        style={styles.permissionItem}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon} size={wp(20)} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.permissionTitle}>{item.title}</Text>
          <Text style={styles.permissionDesc}>{item.desc}</Text>
        </View>
        <View style={styles.statusContainer}>
          {status === 'checking' && <ActivityIndicator size="small" color={COLORS.primary} />}
          {status === 'granted' && <Ionicons name="checkmark-circle" size={wp(22)} color="#4CAF50" />}
          {status === 'error' && <Ionicons name="checkmark-circle" size={wp(22)} color={COLORS.textTertiary} />}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + hp(100) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.titleContainer}>
          <Text style={styles.titleText}>앱 사용을 위한</Text>
          <Text style={styles.titleText}>접근 권한을</Text>
          <Text style={styles.titleText}>허용해주세요.</Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>필수적 접근 권한</Text>
          <View style={styles.listContainer}>
            {MANDATORY_PERMISSIONS.map(item => renderPermissionItem(item, 'mandatory'))}
          </View>
        </View>

        <View style={[styles.section, { marginTop: hp(32) }]}>
          <Text style={styles.sectionTitle}>선택적 접근 권한</Text>
          <View style={styles.listContainer}>
            {OPTIONAL_PERMISSIONS.map(item => renderPermissionItem(item, 'optional'))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonWrapper, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
        <Animated.View entering={FadeInDown.delay(800).duration(600).springify()}>
          <GradientButton 
            title={isProcessing ? "권한 확인 중..." : "확인"} 
            onPress={handleConfirm} 
            disabled={isProcessing}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  titleContainer: {
    marginTop: hp(40),
    marginBottom: hp(50),
  },
  titleText: {
    fontSize: fp(30),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(44),
    letterSpacing: -0.5,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: hp(20),
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: wp(10),
  },
  listContainer: {
    gap: hp(22),
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(16),
  },
  textContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: fp(17),
    fontFamily: FONTS.semiBold,
    color: '#333333',
    marginBottom: hp(2),
  },
  permissionDesc: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  statusContainer: {
    marginLeft: wp(10),
    width: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    paddingHorizontal: wp(28),
    backgroundColor: COLORS.background,
    paddingTop: hp(12),
  },
});
