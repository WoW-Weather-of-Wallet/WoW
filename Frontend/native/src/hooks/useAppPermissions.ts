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
  files: 'unsupported',
  sms: 'unsupported',
  phone: 'unsupported',
  biometrics: 'system',
};

const getNotificationsModule = async () => import('expo-notifications');

const getPermissionState = (granted: boolean, canAskAgain?: boolean): PermissionState => {
  if (granted) {
    return 'granted';
  }

  return canAskAgain ? 'denied' : 'blocked';
};

export function useAppPermissions() {
  const [permissionStates, setPermissionStates] =
    useState<PermissionMap>(INITIAL_PERMISSION_STATES);
  const [biometricLabel, setBiometricLabel] = useState<BiometricLabel>(
    IS_IOS ? '생체 인증' : '지문 인식',
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingAll, setIsRequestingAll] = useState(false);

  const platformLabel = useMemo(() => (IS_IOS ? 'iPhone' : '앱'), []);

  // 단말 종류에 따라 생체 인증 라벨이 달라지므로 권한 상태와 함께 계산합니다.
  const resolveBiometricState = useCallback(async (): Promise<PermissionState> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (IS_IOS) {
      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricLabel('Face ID');
      } else if (
        supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricLabel('Touch ID');
      } else {
        setBiometricLabel('생체 인증');
      }
    } else if (
      supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ) {
      setBiometricLabel('지문 인식');
    } else {
      setBiometricLabel('생체 인증');
    }

    return hasHardware && isEnrolled ? 'granted' : 'system';
  }, []);

  const refreshPermissionStates = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const photoStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      // 실제 요청 가능한 권한만 런타임 상태를 조회하고,
      // 나머지는 화면 정책에 맞는 기본 상태를 유지합니다.
      const nextStates: PermissionMap = {
        ...INITIAL_PERMISSION_STATES,
        camera: getPermissionState(
          cameraStatus.granted,
          cameraStatus.canAskAgain,
        ),
        photo: getPermissionState(photoStatus.granted, photoStatus.canAskAgain),
        biometrics: await resolveBiometricState(),
      };

      if (IS_ANDROID_EXPO_GO) {
        nextStates.notification = 'system';
      } else {
        const Notifications = await getNotificationsModule();
        const notificationStatus = await Notifications.getPermissionsAsync();
        nextStates.notification = getPermissionState(
          notificationStatus.granted,
          notificationStatus.canAskAgain,
        );
      }

      setPermissionStates(nextStates);
    } finally {
      setIsRefreshing(false);
    }
  }, [resolveBiometricState]);

  useEffect(() => {
    refreshPermissionStates();
  }, [refreshPermissionStates]);

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

      if (permissionKey === 'notification') {
        if (IS_ANDROID_EXPO_GO) {
          setPermissionStates((prev) => ({ ...prev, notification: 'system' }));
          return;
        }

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

        setPermissionStates((prev) => ({
          ...prev,
          biometrics: result.success ? 'granted' : 'system',
        }));
        return;
      }

      setPermissionStates((prev) => ({ ...prev, [permissionKey]: 'unsupported' }));
    },
    [biometricLabel],
  );

  const requestAllPermissions = useCallback(async () => {
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
  }, [refreshPermissionStates, requestPermission]);

  return {
    biometricLabel,
    isAndroidExpoGo: IS_ANDROID_EXPO_GO,
    isRefreshing,
    isRequestingAll,
    permissionStates,
    platformLabel,
    refreshPermissionStates,
    requestAllPermissions,
    requestPermission,
  };
}
