import {
  BiometricLabel,
  PermissionKey,
  PermissionState,
} from '../../hooks/useAppPermissions';

// 권한 화면에서만 쓰는 문구와 상태 표현을 한 곳에 모아둡니다.
export type PermissionMeta = {
  id: PermissionKey;
  title: string;
  description: string;
  icon: string;
};

export const getPermissionItems = (
  biometricLabel: BiometricLabel,
  isAndroidExpoGo: boolean,
): PermissionMeta[] => [
  {
    id: 'notification',
    title: '알림',
    description: isAndroidExpoGo
      ? 'Android Expo Go에서는 푸시 알림 권한 동작이 제한됩니다. 개발 빌드에서는 정상적으로 다시 확인할 수 있어요.'
      : '리포트, 챌린지, 소비 패턴 알림을 놓치지 않도록 알림 권한이 필요해요.',
    icon: 'notifications-outline',
  },
  {
    id: 'camera',
    title: '카메라',
    description: '영수증 촬영이나 인증용 이미지 등록에 사용할 수 있어요.',
    icon: 'camera-outline',
  },
  {
    id: 'photo',
    title: '사진',
    description: '갤러리에서 이미지를 불러와 소비 기록에 첨부할 수 있어요.',
    icon: 'image-outline',
  },
  {
    id: 'files',
    title: '파일 접근',
    description:
      '현재 앱에서는 직접 파일 권한을 사용하지 않아 시스템 설정에 맡겨두고 있어요.',
    icon: 'folder-open-outline',
  },
  {
    id: 'sms',
    title: '메시지 접근',
    description: '메시지함 읽기 기능은 현재 앱에서 지원하지 않아요.',
    icon: 'chatbox-ellipses-outline',
  },
  {
    id: 'phone',
    title: '전화 권한',
    description: '전화 상태 접근은 현재 앱에서 직접 사용하지 않아요.',
    icon: 'call-outline',
  },
  {
    id: 'biometrics',
    title: biometricLabel,
    description:
      biometricLabel === 'Face ID'
        ? 'Face ID로 빠르고 안전하게 본인 확인을 진행할 수 있어요.'
        : biometricLabel === 'Touch ID'
          ? 'Touch ID로 빠르고 안전하게 본인 확인을 진행할 수 있어요.'
          : '생체 인증으로 빠르고 안전한 본인 확인을 지원해요.',
    icon: biometricLabel === 'Face ID' ? 'scan-outline' : 'finger-print-outline',
  },
];

export const getPermissionStatusLabel = (state: PermissionState) => {
  switch (state) {
    case 'granted':
      return '허용됨';
    case 'blocked':
      return '설정 필요';
    case 'system':
      return '시스템 관리';
    case 'unsupported':
      return '지원 안 함';
    default:
      return '미허용';
  }
};

export const getPermissionStatusColor = (state: PermissionState) => {
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

export const getPermissionActionLabel = (state: PermissionState) => {
  switch (state) {
    case 'blocked':
      return '설정 열기';
    case 'system':
      return '시스템에서 확인';
    case 'unsupported':
      return '지원 안 함';
    default:
      return '권한 요청';
  }
};
