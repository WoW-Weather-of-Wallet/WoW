import { useCallback, useEffect, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type PermissionKey =
  | 'notification'
  | 'camera'
  | 'photo'
  | 'files'
  | 'sms'
  | 'phone'
  | 'biometrics';

export type PermissionState =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'system'
  | 'unsupported';

export type BiometricLabel =
  | 'Face ID'
  | 'Touch ID'
  | '지문 인식'
  | '생체 인증';

type PermissionMap = Record<PermissionKey, PermissionState>;

const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';
const IS_ANDROID_EXPO_GO =
  IS_ANDROID && Constants.executionEnvironment === 'storeClient';

const INITIAL_PERMISSION_STATES: PermissionMap = {
  notification: 'denied',
  camera: 'denied',
  photo: 'denied',
  files: 'denied',
  sms: 'denied',
  phone: 'denied',
  biometrics: 'system',
};

const getNotificationsModule = async () => import('expo-notifications');

const getPermissionState = (granted: boolean, canAskAgain?: boolean): PermissionState => {
  if (granted) {
    return 'granted';
  }

  return canAskAgain ? 'denied' : 'blocked';
};

/**
 * 앱 전체의 권한 상태를 관리하고 제어하는 커스텀 훅입니다.
 * 금융 서비스의 보안을 위해 'Security Gate' 개념을 도입하여 필수 권한을 엄격히 검증합니다.
 */
export function useAppPermissions() {
  const [permissionStates, setPermissionStates] =
    useState<PermissionMap>(INITIAL_PERMISSION_STATES);
  const [biometricLabel, setBiometricLabel] = useState<BiometricLabel>(
    IS_IOS ? '생체 인증' : '지문 인식',
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingAll, setIsRequestingAll] = useState(false);

  const platformLabel = useMemo(() => (IS_IOS ? 'iPhone' : '앱'), []);

  /**
   * 단말의 하드웨어 상태에 따라 생체 인증 라벨과 이용 가능 여부를 확인합니다.
   */
  const resolveBiometricState = useCallback(async (): Promise<PermissionState> => {
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

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

    return 'denied';
  }, []);

  /**
   * 카메라, 사진, 생체 인증 등 실제 OS 권한 상태를 동기화합니다.
   * 부드러운 애니메이션 체감을 위해 최소 1.2초의 지연 시간을 보장합니다.
   */
  const refreshPermissionStates = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const photoStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isBiometricAvailable = hasHardware && isEnrolled;

      // 애니메이션 싱크를 위한 인위적 지연 (로딩 아이콘 1회전 시간)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPermissionStates((prev) => {
        const nextStates: PermissionMap = {
          ...prev,
          camera: getPermissionState(
            cameraStatus.granted,
            cameraStatus.canAskAgain,
          ),
          photo: getPermissionState(photoStatus.granted, photoStatus.canAskAgain),
          biometrics: prev.biometrics === 'granted' ? 'granted' : (isBiometricAvailable ? 'denied' : 'system'),
        };

        return nextStates;
      });

      // 알림 권한 확인 (Expo Go 환경 제외)
      if (!IS_ANDROID_EXPO_GO) {
        const Notifications = await getNotificationsModule();
        const notificationStatus = await Notifications.getPermissionsAsync();
        setPermissionStates(prev => ({
          ...prev,
          notification: getPermissionState(
            notificationStatus.granted,
            notificationStatus.canAskAgain,
          )
        }));
      }
    } catch (e) {
      console.error('Permission refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 앱 진입 시 초기 상태 로드 후, 0.8초 뒤 전체 권한 요청 팝업을 순차적으로 트리거
    const initPermissions = async () => {
      await refreshPermissionStates();
      setTimeout(() => {
        void requestAllPermissions();
      }, 800);
    };
    
    initPermissions();
  }, []);

  /**
   * 특정 권한 항목에 대해 요청을 수행하거나 (시뮬레이션의 경우) 상태를 토글합니다.
   */
  const requestPermission = useCallback(
    async (permissionKey: PermissionKey) => {
      if (permissionKey === 'camera') {
        const status = await ImagePicker.requestCameraPermissionsAsync();
        setPermissionStates((prev) => ({
          ...prev,
          camera: getPermissionState(status.granted, status.canAskAgain),
        }));
        return;
      }

      if (permissionKey === 'photo') {
        const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setPermissionStates((prev) => ({
          ...prev,
          photo: getPermissionState(status.granted, status.canAskAgain),
        }));
        return;
      }

      // 실제 알림 권한 요청 (Expo Go가 아닐 때만)
      if (permissionKey === 'notification' && !IS_ANDROID_EXPO_GO) {
        const Notifications = await getNotificationsModule();
        const status = await Notifications.requestPermissionsAsync();
        setPermissionStates((prev) => ({
          ...prev,
          notification: getPermissionState(status.granted, status.canAskAgain),
        }));
        return;
      }

      if (permissionKey === 'biometrics') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: IS_IOS ? biometricLabel : '생체 인증으로 확인해주세요.',
          cancelLabel: '취소',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setPermissionStates((prev) => ({ ...prev, biometrics: 'granted' }));
        }
        return;
      }

      // 시뮬레이션 권한 토글 로직 (전화, 메시지, 파일 + Expo Go의 알림)
      // 금융 앱에서 취소/재허용 동작을 테스트하기 위해 내부 상태로 관리합니다.
      const simulatedKeys = ['files', 'sms', 'phone'];
      if (IS_ANDROID_EXPO_GO) simulatedKeys.push('notification');

      if (simulatedKeys.includes(permissionKey)) {
        if (permissionStates[permissionKey] === 'granted') {
          setPermissionStates((prev) => ({ ...prev, [permissionKey]: 'denied' }));
          return;
        }
        // 실제 팝업의 느낌을 주기 위한 미세한 지연
        await new Promise((resolve) => setTimeout(resolve, 600));
        setPermissionStates((prev) => ({ ...prev, [permissionKey]: 'granted' }));
        return;
      }

      setPermissionStates((prev) => ({ ...prev, [permissionKey]: 'unsupported' }));
    },
    [biometricLabel, permissionStates],
  );

  /**
   * 모든 권한 항목을 순차적으로(필수 -> 선택 순) 요청합니다.
   */
  const requestAllPermissions = useCallback(async () => {
    setIsRequestingAll(true);

    try {
      // 1. 보안 필수 권한 우선 요청
      await requestPermission('phone');
      await requestPermission('sms');
      await requestPermission('biometrics');
      
      // 2. 부가 기능 선택 권한 요청
      await requestPermission('notification');
      await requestPermission('camera');
      await requestPermission('photo');
      await requestPermission('files');
      
      await refreshPermissionStates();
    } finally {
      setIsRequestingAll(false);
    }
  }, [refreshPermissionStates, requestPermission]);

  return {
    biometricLabel,
    isAndroidExpoGo: IS_ANDROID_EXPO_GO,
    isRefreshing,
    isRequestingAll,
    permissionStates,
    setPermissionStates,
    platformLabel,
    refreshPermissionStates,
    requestAllPermissions,
    requestPermission,
  };
}
