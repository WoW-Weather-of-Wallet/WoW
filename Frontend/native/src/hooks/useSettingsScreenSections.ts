import { useMemo } from 'react';
import { Platform } from 'react-native';
import type { NativeUserProfileResponse } from '../services/auth';
import type { LocalSecurityPreferences } from '../services/localSecurity';
import { maskPhoneNumber } from '../utils/phoneFormat';
import type { SettingItemProps } from '../components/mypage';

interface SettingsDescriptionRowConfig {
  kind: 'description';
  key: string;
  description: string;
  switchValue?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

interface SettingsItemRowConfig {
  kind: 'item';
  key: string;
  props: SettingItemProps;
}

export type SettingsSectionRowConfig =
  | SettingsItemRowConfig
  | SettingsDescriptionRowConfig;

export interface SettingsSectionConfig {
  key: string;
  title?: string;
  rows: SettingsSectionRowConfig[];
}

interface UseSettingsScreenSectionsOptions {
  profile: NativeUserProfileResponse | null;
  sessionLoginType: string | null;
  securityPreferences: LocalSecurityPreferences;
  notificationEnabled: boolean;
  isLoading: boolean;
  isNotificationSubmitting: boolean;
  appVersion: string;
  onEditProfile: () => void;
  onEditPassword: () => void;
  onEditPhone: () => void;
  onToggleNotifications: (value: boolean) => void;
  onOpenPinEditor: () => void;
  onToggleBiometric: (value: boolean) => void;
  onClearPinCode: () => void;
  onOpenTerms: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function useSettingsScreenSections({
  profile,
  sessionLoginType,
  securityPreferences,
  notificationEnabled,
  isLoading,
  isNotificationSubmitting,
  appVersion,
  onEditProfile,
  onEditPassword,
  onEditPhone,
  onToggleNotifications,
  onOpenPinEditor,
  onToggleBiometric,
  onClearPinCode,
  onOpenTerms,
  onLogout,
  onDeleteAccount,
}: UseSettingsScreenSectionsOptions) {
  return useMemo(() => {
    const pushToggleDescription = notificationEnabled ? '사용 중' : '사용 안 함';
    const loginType = profile?.loginType ?? sessionLoginType;
    const userIdentifier = profile?.userId ?? (loginType === 'SSAFY' ? 'SSAFY 계정' : '-');
    const phoneDisplay = maskPhoneNumber(profile?.phoneNumber ?? '') || '-';
    const biometricDescription = securityPreferences.biometricEnabled ? '사용 중' : '사용 안 함';
    const pinDescription = securityPreferences.pinEnabled ? '설정됨' : '설정 안 됨';
    const canShowBiometricSetting = securityPreferences.pinEnabled && Platform.OS !== 'ios';

    const sections: SettingsSectionConfig[] = [
      {
        key: 'account',
        title: '계정 정보',
        rows: [
          {
            kind: 'item',
            key: 'user-id',
            props: {
              label: '아이디',
              value: userIdentifier,
              type: 'text',
            },
          },
          {
            kind: 'item',
            key: 'profile-name',
            props: {
              label: '프로필 정보 수정',
              value: profile?.name ?? '-',
              onPress: onEditProfile,
            },
          },
          {
            kind: 'item',
            key: 'password',
            props: {
              label: '비밀번호 변경',
              onPress: onEditPassword,
            },
          },
          {
            kind: 'item',
            key: 'phone',
            props: {
              label: '휴대폰 번호',
              value: phoneDisplay,
              onPress: onEditPhone,
            },
          },
        ],
      },
      {
        key: 'notifications',
        title: '알림 설정',
        rows: [
          {
            kind: 'item',
            key: 'notification-status',
            props: {
              label: '알림 상태',
              value: pushToggleDescription,
              type: 'text',
            },
          },
          {
            kind: 'description',
            key: 'notification-description',
            description: '앱에서 보내는 금융 알림 수신 여부를 설정합니다.',
            switchValue: notificationEnabled,
            onToggle: onToggleNotifications,
            disabled: isLoading || isNotificationSubmitting,
          },
        ],
      },
      {
        key: 'security',
        title: '보안 설정',
        rows: [
          {
            kind: 'item',
            key: 'pin',
            props: {
              label: securityPreferences.pinEnabled
                ? '간편 비밀번호 변경'
                : '간편 비밀번호 설정',
              value: pinDescription,
              onPress: onOpenPinEditor,
            },
          },
          {
            kind: 'description',
            key: 'pin-description',
            description: '앱 진입 시 간편 비밀번호로 본인 확인을 진행합니다.',
          },
          ...(canShowBiometricSetting
            ? [
                {
                  kind: 'item',
                  key: 'biometric',
                  props: {
                    label: '생체 인증 사용',
                    value: biometricDescription,
                    type: 'toggle',
                    isToggled: securityPreferences.biometricEnabled,
                    onToggle: onToggleBiometric,
                  },
                } satisfies SettingsItemRowConfig,
                {
                  kind: 'description',
                  key: 'biometric-description',
                  description:
                    '생체 인증을 켜면 간편 비밀번호 대신 더 빠르게 잠금을 해제할 수 있어요.',
                } satisfies SettingsDescriptionRowConfig,
              ]
            : []),
          ...(securityPreferences.pinEnabled
            ? [
                {
                  kind: 'item',
                  key: 'pin-clear',
                  props: {
                    label: '간편 비밀번호 삭제',
                    isDanger: true,
                    onPress: onClearPinCode,
                  },
                } satisfies SettingsItemRowConfig,
              ]
            : []),
        ],
      },
      {
        key: 'support',
        title: '이용 안내',
        rows: [
          {
            kind: 'item',
            key: 'terms',
            props: {
              label: '이용 약관 확인',
              onPress: onOpenTerms,
            },
          },
          {
            kind: 'item',
            key: 'version',
            props: {
              label: '현재 버전',
              value: appVersion,
              type: 'text',
            },
          },
        ],
      },
      {
        key: 'actions',
        rows: [
          {
            kind: 'item',
            key: 'logout',
            props: {
              label: '로그아웃',
              onPress: onLogout,
            },
          },
          {
            kind: 'item',
            key: 'withdraw',
            props: {
              label: '회원 탈퇴',
              isDanger: true,
              onPress: onDeleteAccount,
            },
          },
        ],
      },
    ];

    return {
      profileDisplayName: profile?.name ?? '사용자',
      loadingMessage: '설정 화면을 준비하고 있어요.',
      sections,
    };
  }, [
    appVersion,
    isLoading,
    isNotificationSubmitting,
    notificationEnabled,
    onClearPinCode,
    onDeleteAccount,
    onEditPassword,
    onEditPhone,
    onEditProfile,
    onLogout,
    onOpenPinEditor,
    onOpenTerms,
    onToggleBiometric,
    onToggleNotifications,
    profile,
    securityPreferences.biometricEnabled,
    securityPreferences.pinEnabled,
    sessionLoginType,
  ]);
}
