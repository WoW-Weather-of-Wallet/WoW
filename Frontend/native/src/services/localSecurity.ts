import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface LocalSecurityPreferences {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pinHash?: string;
  pinSalt?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  errorMessage?: string;
}

const LOCAL_SECURITY_KEY = 'wow.local.security.v1';
const IS_TEMPORARY_IOS_BIOMETRIC_DISABLED = Platform.OS === 'ios';

const DEFAULT_LOCAL_SECURITY_PREFERENCES: LocalSecurityPreferences = {
  biometricEnabled: false,
  pinEnabled: false,
};

const parseJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('[localSecurity] JSON parse failed:', error);
    return null;
  }
};

const buildPinSalt = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const digestPin = async (pin: string, salt: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

export const loadLocalSecurityPreferences = async (): Promise<LocalSecurityPreferences> => {
  const raw = await SecureStore.getItemAsync(LOCAL_SECURITY_KEY);
  const parsed = parseJson<LocalSecurityPreferences>(raw);

  return {
    ...DEFAULT_LOCAL_SECURITY_PREFERENCES,
    ...parsed,
  };
};

export const saveLocalSecurityPreferences = async (
  preferences: LocalSecurityPreferences,
) => {
  await SecureStore.setItemAsync(LOCAL_SECURITY_KEY, JSON.stringify(preferences));
};

export const updateLocalSecurityPreferences = async (
  updater: (current: LocalSecurityPreferences) => LocalSecurityPreferences,
) => {
  const current = await loadLocalSecurityPreferences();
  const next = updater(current);
  await saveLocalSecurityPreferences(next);
  return next;
};

export const hasLocalSecurityEnabled = (preferences: LocalSecurityPreferences) =>
  preferences.biometricEnabled || preferences.pinEnabled;

export const savePinCode = async (pin: string) => {
  const salt = buildPinSalt();
  const hash = await digestPin(pin, salt);

  return updateLocalSecurityPreferences((current) => ({
    ...current,
    pinEnabled: true,
    pinHash: hash,
    pinSalt: salt,
  }));
};

export const clearPinCode = async () =>
  updateLocalSecurityPreferences((current) => ({
    ...current,
    pinEnabled: false,
    pinHash: undefined,
    pinSalt: undefined,
    biometricEnabled: false,
  }));

export const verifyPinCode = async (pin: string, preferences?: LocalSecurityPreferences) => {
  const current = preferences ?? (await loadLocalSecurityPreferences());

  if (!current.pinEnabled || !current.pinHash || !current.pinSalt) {
    return false;
  }

  const digest = await digestPin(pin, current.pinSalt);
  return digest === current.pinHash;
};

export const setBiometricEnabled = async (enabled: boolean) =>
  updateLocalSecurityPreferences((current) => ({
    ...current,
    biometricEnabled: enabled,
  }));

export const authenticateWithBiometrics = async (
  promptMessage = '생체 인증으로 확인해주세요.',
): Promise<BiometricAuthResult> => {
  // TODO(iOS): 이번 주 범위에서는 iOS 생체 인증 QA를 보류합니다.
  if (IS_TEMPORARY_IOS_BIOMETRIC_DISABLED) {
    return {
      success: false,
      errorMessage: '이번 주에는 iOS 생체 인증을 사용하지 않습니다.',
    };
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return {
      success: false,
      errorMessage: '이 기기에서는 생체 인증을 사용할 수 없어요.',
    };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: '취소',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return {
      success: false,
      errorMessage:
        result.error === 'user_cancel'
          ? '생체 인증이 취소되었어요.'
          : '생체 인증에 실패했어요. 다시 시도해주세요.',
    };
  }

  return { success: true };
};
