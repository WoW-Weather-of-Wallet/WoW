import React, { useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type PermissionKey = 'notification' | 'camera' | 'photo' | 'files' | 'sms' | 'phone' | 'biometrics';
type PermissionState = 'granted' | 'denied' | 'blocked' | 'system' | 'unsupported';

type PermissionMeta = {
  id: PermissionKey;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type BiometricLabel = 'Face ID' | 'Touch ID' | '지문 인식' | '생체 인증';

const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const ANDROID_VERSION = typeof Platform.Version === 'number' ? Platform.Version : 0;
const IS_ANDROID_EXPO_GO =
  IS_ANDROID && Constants.executionEnvironment === 'storeClient';

const getNotificationsModule = async () => import('expo-notifications');

const getStatusLabel = (state: PermissionState) => {
  switch (state) {
    case 'granted':
      return '허용됨';
    case 'blocked':
      return '설정 필요';
    case 'system':
      return '기기 설정';
    case 'unsupported':
      return '미지원';
    default:
      return '미허용';
  }
};

const getStatusColor = (state: PermissionState) => {
  switch (state) {
    case 'granted':
      return '#16A34A';
    case 'blocked':
      return '#DC2626';
    case 'system':
      return '#2563EB';
    case 'unsupported':
      return '#6B7280';
    default:
      return '#9CA3AF';
  }
};

const getPlatformLabel = () => (IS_IOS ? 'iPhone' : '앱');

export default function AccessPermissionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [permissionStates, setPermissionStates] = useState<Record<PermissionKey, PermissionState>>({
    notification: 'denied',
    camera: 'denied',
    photo: 'denied',
    files: 'unsupported',
    sms: 'unsupported',
    phone: 'unsupported',
    biometrics: 'system',
  });
  const [biometricLabel, setBiometricLabel] = useState<BiometricLabel>(IS_IOS ? '생체 인증' : '생체 인증');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingAll, setIsRequestingAll] = useState(false);

  const permissionItems = useMemo<PermissionMeta[]>(
    () => [
      {
        id: 'notification',
        title: '알림',
        description: IS_ANDROID_EXPO_GO
          ? '안드로이드 Expo Go에서는 실제 알림 권한 요청 대신 개발 빌드에서 확인해야 합니다.'
          : '예산, 소비 내역, 리마인더 알림을 받기 위해 사용합니다.',
        icon: 'notifications-outline',
      },
      {
        id: 'camera',
        title: '카메라',
        description: '프로필 사진 촬영이나 증빙 이미지 등록에 사용합니다.',
        icon: 'camera-outline',
      },
      {
        id: 'photo',
        title: '갤러리',
        description: '저장된 사진을 선택해 업로드할 때 사용합니다.',
        icon: 'image-outline',
      },
      {
        id: 'files',
        title: '파일 접근',
        description: '현재 브랜치에서는 시스템 파일 선택 권한 흐름이 아직 연결되지 않았습니다.',
        icon: 'folder-open-outline',
      },
      {
        id: 'sms',
        title: '메시지 접근',
        description: '현재 브랜치에서는 문자함 접근 권한을 사용하지 않습니다.',
        icon: 'chatbox-ellipses-outline',
      },
      {
        id: 'phone',
        title: '전화 권한',
        description: '현재 브랜치에서는 전화 상태나 전화 권한을 사용하지 않습니다.',
        icon: 'call-outline',
      },
      {
        id: 'biometrics',
        title: biometricLabel,
        description: IS_IOS
          ? '단말에 설정된 Face ID 또는 Touch ID 사용 가능 여부를 확인합니다.'
          : '안드로이드 단말의 생체 인증 사용 가능 여부를 확인합니다.',
        icon: biometricLabel === 'Face ID' ? 'scan-outline' : 'finger-print-outline',
      },
    ],
    [biometricLabel],
  );

  const resolveBiometricState = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (IS_IOS) {
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricLabel('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricLabel('Touch ID');
      } else {
        setBiometricLabel('생체 인증');
      }
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricLabel('지문 인식');
    } else {
      setBiometricLabel('생체 인증');
    }

    return hasHardware && isEnrolled ? 'granted' : 'system';
  };

  const refreshPermissionStates = async () => {
    setIsRefreshing(true);

    try {
      const nextStates = { ...permissionStates };

      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      nextStates.camera = cameraStatus.granted
        ? 'granted'
        : cameraStatus.canAskAgain
          ? 'denied'
          : 'blocked';

      const photoStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      nextStates.photo = photoStatus.granted
        ? 'granted'
        : photoStatus.canAskAgain
          ? 'denied'
          : 'blocked';

      if (IS_ANDROID_EXPO_GO) {
        nextStates.notification = 'system';
      } else {
        const Notifications = await getNotificationsModule();
        const notificationStatus = await Notifications.getPermissionsAsync();
        nextStates.notification = notificationStatus.granted
          ? 'granted'
          : notificationStatus.canAskAgain
            ? 'denied'
            : 'blocked';
      }

      nextStates.files = 'unsupported';
      nextStates.sms = 'unsupported';
      nextStates.phone = 'unsupported';
      nextStates.biometrics = await resolveBiometricState();

      setPermissionStates(nextStates);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshPermissionStates();
  }, []);

  const requestPermission = async (id: PermissionKey) => {
    if (id === 'camera') {
      const status = await ImagePicker.requestCameraPermissionsAsync();
      setPermissionStates((prev) => ({
        ...prev,
        camera: status.granted ? 'granted' : status.canAskAgain ? 'denied' : 'blocked',
      }));
      return;
    }

    if (id === 'photo') {
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionStates((prev) => ({
        ...prev,
        photo: status.granted ? 'granted' : status.canAskAgain ? 'denied' : 'blocked',
      }));
      return;
    }

    if (id === 'notification') {
      if (IS_ANDROID_EXPO_GO) {
        setPermissionStates((prev) => ({ ...prev, notification: 'system' }));
        return;
      }

      const Notifications = await getNotificationsModule();
      const status = await Notifications.requestPermissionsAsync();
      setPermissionStates((prev) => ({
        ...prev,
        notification: status.granted ? 'granted' : status.canAskAgain ? 'denied' : 'blocked',
      }));
      return;
    }

    if (id === 'biometrics') {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: IS_IOS ? biometricLabel : '생체 인증을 확인해 주세요',
        cancelLabel: '취소',
        disableDeviceFallback: false,
      });

      setPermissionStates((prev) => ({
        ...prev,
        biometrics: result.success ? 'granted' : 'system',
      }));
      return;
    }

    setPermissionStates((prev) => ({ ...prev, [id]: 'unsupported' }));
  };

  const requestAllPermissions = async () => {
    setIsRequestingAll(true);

    try {
      await requestPermission('notification');
      await requestPermission('camera');
      await requestPermission('photo');
      await requestPermission('biometrics');
      await refreshPermissionStates();
    } finally {
      setIsRequestingAll(false);
    }
  };

  const handleConfirm = () => {
    navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + hp(24) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.titleContainer}>
          <Text style={styles.titleText}>{getPlatformLabel()} 사용에 필요한</Text>
          <Text style={styles.titleText}>권한 상태를 확인하고</Text>
          <Text style={styles.titleText}>원하는 항목만 허용해 주세요.</Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {permissionItems.map((item, index) => {
            const state = permissionStates[item.id];
            const isBlocked = state === 'blocked';
            const isUnsupported = state === 'unsupported';
            const isSystemManaged = state === 'system';
            const canRequest = !isUnsupported && !isSystemManaged;

            return (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(220 + index * 90).duration(420).springify()}
                style={styles.permissionCard}
              >
                <View style={styles.permissionHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={wp(20)} color={COLORS.primary} />
                  </View>

                  <View style={styles.permissionCopy}>
                    <Text style={styles.permissionTitle}>{item.title}</Text>
                    <Text style={styles.permissionDescription}>{item.description}</Text>
                  </View>

                  <View style={[styles.statusBadge, { borderColor: getStatusColor(state) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(state) }]}>
                      {getStatusLabel(state)}
                    </Text>
                  </View>
                </View>

                <View style={styles.permissionActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, (isBlocked || isSystemManaged) && styles.secondaryActionButton]}
                    onPress={() => {
                      if (isUnsupported) {
                        return;
                      }
                      if (isBlocked || isSystemManaged) {
                        openSettings();
                        return;
                      }
                      requestPermission(item.id);
                    }}
                    disabled={isUnsupported}
                  >
                    <Text style={[styles.actionButtonText, !canRequest && styles.disabledText]}>
                      {isUnsupported
                        ? '현재 미지원'
                        : isBlocked
                          ? '설정 열기'
                          : isSystemManaged
                            ? '기기 설정에서 확인'
                            : '권한 요청'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.refreshRow} onPress={refreshPermissionStates} disabled={isRefreshing}>
            {isRefreshing ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
            )}
            <Text style={styles.refreshText}>권한 상태 새로고침</Text>
          </TouchableOpacity>

          <GradientButton
            title={isRequestingAll ? '권한 요청 중...' : '가능한 권한 한 번에 요청'}
            onPress={requestAllPermissions}
          />

          <View style={styles.skipButton}>
            <GradientButton title="다음으로" onPress={handleConfirm} variant="outline" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(24),
  },
  scrollContent: {
    paddingBottom: hp(24),
  },
  titleContainer: {
    marginTop: hp(20),
    marginBottom: hp(20),
  },
  titleText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(34),
    letterSpacing: -0.5,
  },
  listContainer: {
    gap: hp(10),
  },
  permissionCard: {
    borderRadius: wp(20),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(14),
    paddingVertical: hp(13),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  permissionCopy: {
    flex: 1,
    paddingRight: wp(8),
  },
  permissionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: '#111827',
    marginBottom: hp(2),
  },
  permissionDescription: {
    fontSize: fp(12),
    lineHeight: fp(17),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  statusText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
  },
  permissionActions: {
    marginTop: hp(10),
    alignItems: 'flex-end',
  },
  actionButton: {
    borderRadius: wp(999),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    backgroundColor: '#EEF2FF',
  },
  secondaryActionButton: {
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  disabledText: {
    color: '#6B7280',
  },
  footer: {
    paddingTop: hp(18),
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    marginBottom: hp(14),
  },
  refreshText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  skipButton: {
    marginTop: hp(12),
  },
});
