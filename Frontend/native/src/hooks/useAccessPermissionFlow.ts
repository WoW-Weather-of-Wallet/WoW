import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  getPermissionItems,
  type PermissionMeta,
} from '../constants/auth/permissionConfig';
import { useAuthStore } from '../store/authStore';
import type { RootNavigationProp } from '../types';
import { PermissionKey, useAppPermissions } from './useAppPermissions';

const MANDATORY_PERMISSION_KEYS: PermissionKey[] = ['biometrics', 'phone', 'sms'];
const SIMULATED_PERMISSION_KEYS: PermissionKey[] = ['phone', 'sms', 'files'];
const MISSING_PERMISSION_TITLE = '필수 권한 미허용';
const MISSING_PERMISSION_MESSAGE =
  '금융 서비스 이용을 위해 필수 접근 권한(생체 인증, 전화, 메시지) 허용이 반드시 필요합니다. 모든 필수 항목을 허용해 주세요.';
const GRANTED_PERMISSION_TITLE = '권한 안내';
const GRANTED_PERMISSION_MESSAGE =
  '이미 허용된 권한입니다. 권한 취소는 기기의 [설정 > 애플리케이션 > WOW]에서 가능합니다.';

export function useAccessPermissionFlow() {
  const navigation = useNavigation<RootNavigationProp>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    biometricLabel,
    isAndroidExpoGo,
    isRefreshing,
    isRequestingAll,
    permissionStates,
    refreshPermissionStates,
    requestAllPermissions,
    requestPermission,
  } = useAppPermissions();
  const rotation = useSharedValue(0);

  const permissionItems = useMemo(
    () => getPermissionItems(biometricLabel),
    [biometricLabel],
  );

  const mandatoryPermissionItems = useMemo(
    () => permissionItems.filter((item) => item.type === 'mandatory'),
    [permissionItems],
  );

  const optionalPermissionItems = useMemo(
    () => permissionItems.filter((item) => item.type === 'optional'),
    [permissionItems],
  );

  useEffect(() => {
    if (!isRefreshing) {
      return;
    }

    rotation.value = 0;
    rotation.value = withTiming(360, {
      duration: 1200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isRefreshing, rotation]);

  const animatedRotationStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleConfirm = useCallback(() => {
    const missingPermissions = MANDATORY_PERMISSION_KEYS.filter(
      (key) => permissionStates[key] !== 'granted',
    );

    if (missingPermissions.length > 0) {
      Alert.alert(MISSING_PERMISSION_TITLE, MISSING_PERMISSION_MESSAGE, [
        { text: '확인' },
      ]);
      return;
    }

    navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
  }, [isAuthenticated, navigation, permissionStates]);

  const handlePermissionPress = useCallback(
    (permissionKey: PermissionKey) => {
      const state = permissionStates[permissionKey];
      const simulatedKeys = isAndroidExpoGo
        ? [...SIMULATED_PERMISSION_KEYS, 'notification']
        : SIMULATED_PERMISSION_KEYS;

      if (state === 'granted') {
        if (simulatedKeys.includes(permissionKey)) {
          void requestPermission(permissionKey);
          return;
        }

        Alert.alert(GRANTED_PERMISSION_TITLE, GRANTED_PERMISSION_MESSAGE, [
          { text: '확인' },
        ]);
        return;
      }

      void requestPermission(permissionKey);
    },
    [isAndroidExpoGo, permissionStates, requestPermission],
  );

  const buildPermissionCard = useCallback(
    ({
      item,
      index,
      delayBase,
    }: {
      item: PermissionMeta;
      index: number;
      delayBase: number;
    }) => ({
      item,
      delay: delayBase + index * 80,
      state: permissionStates[item.id as PermissionKey],
    }),
    [permissionStates],
  );

  return {
    isRefreshing,
    isRequestingAll,
    refreshPermissionStates,
    requestAllPermissions,
    handleConfirm,
    handlePermissionPress,
    mandatoryPermissionCards: mandatoryPermissionItems.map((item, index) =>
      buildPermissionCard({ item, index, delayBase: 200 }),
    ),
    optionalPermissionCards: optionalPermissionItems.map((item, index) =>
      buildPermissionCard({ item, index, delayBase: 300 }),
    ),
    animatedRotationStyles,
    shouldShowRequestAllButton: !isRefreshing && !isRequestingAll,
  };
}
