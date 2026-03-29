import { useMemo } from 'react';
import type { NativeUserProfileResponse } from '../services/auth';
import type { LocalSecurityPreferences } from '../services/localSecurity';
import { maskPhoneNumber } from '../utils/phoneFormat';
import type { SettingItemProps } from '../components/mypage';

interface MyPageSectionConfig {
  key: string;
  title: string;
  items: SettingItemProps[];
}

interface UseMyPageSectionsOptions {
  profile: NativeUserProfileResponse | null;
  sessionUserName?: string | null;
  sessionLoginType?: string | null;
  notificationEnabled: boolean;
  isNotificationSubmitting: boolean;
  securityPreferences: LocalSecurityPreferences;
  appVersion: string;
  onOpenProfile: () => void;
  onOpenPhoneGuidance: () => void;
  onOpenPassword: () => void;
  onToggleNotifications: (enabled: boolean) => void;
  onOpenPinEditor: () => void;
  onToggleBiometric: (enabled: boolean) => void;
  onClearPinCode: () => void;
  onOpenTerms: () => void;
}

export function useMyPageSections({
  profile,
  sessionUserName,
  sessionLoginType,
  notificationEnabled,
  isNotificationSubmitting,
  securityPreferences,
  appVersion,
  onOpenProfile,
  onOpenPhoneGuidance,
  onOpenPassword,
  onToggleNotifications,
  onOpenPinEditor,
  onToggleBiometric,
  onClearPinCode,
  onOpenTerms,
}: UseMyPageSectionsOptions) {
  return useMemo(() => {
    const displayName = profile?.name ?? sessionUserName ?? '사용자';
    const displayBadge =
      (profile?.loginType ?? sessionLoginType) === 'SSAFY' ? 'SSAFY 회원' : '일반 회원';
    const phoneDisplay = maskPhoneNumber(profile?.phoneNumber ?? '') || '-';

    const sections: MyPageSectionConfig[] = [
      {
        key: 'account',
        title: '계정 정보',
        items: [
          {
            label: '아이디',
            value: profile?.userId || '-',
            type: 'text',
          },
          {
            label: '프로필 정보',
            value: displayName,
            onPress: onOpenProfile,
          },
          {
            label: '비밀번호 변경',
            onPress: onOpenPassword,
          },
          {
            label: '휴대폰 번호',
            value: phoneDisplay,
            onPress: onOpenPhoneGuidance,
          },
        ],
      },
      {
        key: 'security',
        title: '알림 및 보안',
        items: [
          {
            label: '알림 상태',
            type: 'toggle',
            isToggled: notificationEnabled,
            onToggle: onToggleNotifications,
            isDisabled: isNotificationSubmitting,
          },
          {
            label: securityPreferences.pinEnabled ? '간편비밀번호 변경' : '간편비밀번호 설정',
            value: securityPreferences.pinEnabled ? '설정됨' : '미설정',
            onPress: onOpenPinEditor,
          },
          ...(securityPreferences.pinEnabled
            ? [
                {
                  label: '생체인증 사용',
                  type: 'toggle' as const,
                  isToggled: securityPreferences.biometricEnabled,
                  onToggle: onToggleBiometric,
                },
                {
                  label: '간편비밀번호 해제',
                  isDanger: true,
                  onPress: onClearPinCode,
                },
              ]
            : []),
        ],
      },
      {
        key: 'support',
        title: '이용 안내',
        items: [
          {
            label: '동의한 약관 확인',
            onPress: onOpenTerms,
          },
          {
            label: '현재 버전',
            value: appVersion,
            type: 'text',
          },
        ],
      },
    ];

    return {
      displayName,
      displayBadge,
      sections,
    };
  }, [
    appVersion,
    isNotificationSubmitting,
    notificationEnabled,
    onClearPinCode,
    onOpenPassword,
    onOpenPhoneGuidance,
    onOpenPinEditor,
    onOpenProfile,
    onOpenTerms,
    onToggleNotifications,
    onToggleBiometric,
    profile,
    securityPreferences.biometricEnabled,
    securityPreferences.pinEnabled,
    sessionLoginType,
    sessionUserName,
  ]);
}
