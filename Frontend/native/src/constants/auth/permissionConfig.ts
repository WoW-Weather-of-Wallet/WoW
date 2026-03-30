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
  type: 'mandatory' | 'optional';
};

export const getPermissionItems = (
  biometricLabel: BiometricLabel,
): PermissionMeta[] => [
  {
    id: 'biometrics',
    title: biometricLabel,
    description:
      biometricLabel === 'Face ID'
        ? 'Face ID로 빠르고 안전하게 본인 확인을 진행합니다.'
        : biometricLabel === 'Touch ID'
          ? 'Touch ID로 빠르고 안전하게 본인 확인을 진행합니다.'
          : '생체 인증으로 빠르고 안전한 본인 확인을 지원합니다.',
    icon: biometricLabel === 'Face ID' ? 'scan-outline' : 'finger-print-outline',
    type: 'mandatory',
  },
  {
    id: 'notification',
    title: '알림',
    description: '리포트, 챌린지, 소비 패턴 알림을 실시간으로 보내드립니다.',
    icon: 'notifications-outline',
    type: 'optional',
  },
  {
    id: 'camera',
    title: '카메라',
    description: '영수증 촬영이나 인증용 이미지 등록에 사용합니다.',
    icon: 'camera-outline',
    type: 'optional',
  },
  {
    id: 'photo',
    title: '사진',
    description: '갤러리 이미지를 소비 기록에 첨부할 수 있습니다.',
    icon: 'image-outline',
    type: 'optional',
  },
  {
    id: 'files',
    title: '파일 접근',
    description: '안전한 데이터 보관 및 문서 첨부를 위해 접근이 필요합니다.',
    icon: 'folder-open-outline',
    type: 'optional',
  },
  {
    id: 'sms',
    title: '메시지 접근',
    description: '인증 번호 자동 입력 및 거래 내역 연동을 지원합니다.',
    icon: 'chatbox-ellipses-outline',
    type: 'mandatory',
  },
  {
    id: 'phone',
    title: '전화 권한',
    description: '고객 센터 연결 및 기기 인증 보안을 위해 사용합니다.',
    icon: 'call-outline',
    type: 'mandatory',
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
