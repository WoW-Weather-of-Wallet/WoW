import { Dimensions, PixelRatio } from 'react-native';

// =============================================
// 테마 상수 - 앱 전체에서 사용하는 디자인 토큰
// =============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 기준 디자인 사이즈 (일반적인 안드로이드 기기)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * 반응형 가로 크기 계산
 * 디자인 기준 375px 대비 현재 화면 비율로 변환
 */
export const wp = (widthPercent: number): number => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / BASE_WIDTH);
};

/**
 * 반응형 세로 크기 계산
 * 디자인 기준 812px 대비 현재 화면 비율로 변환
 */
export const hp = (heightPercent: number): number => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / BASE_HEIGHT);
};

/**
 * 반응형 폰트 크기 계산
 */
export const fp = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// =============================================
// 색상 팔레트
// =============================================
export const COLORS = {
  // 메인 테마 컬러
  primary: '#6666ee',
  primaryLight: '#8888f4',
  primaryDark: '#4d4dcc',
  primarySoft: '#e0e0fb',
  primary50: '#f0f0fd',

  // 배경
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7FC',
  backgroundTertiary: '#EFEFFA',

  // 텍스트
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // 보더
  border: '#E5E7EB',
  borderFocus: '#6666ee',

  // 상태
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // 그라데이션
  gradientStart: '#7B7BF5',
  gradientEnd: '#5252CC',

  // 공통 그레이 스케일 (추가)
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // 마이페이지 전용 악센트 컬러 (추가)
  accentPrimaryLight: '#DCD8FF',
  accentMintLight: '#D7F4E9',
  accentGoldLight: '#F9EAC5',
  cardOverlay1: '#DAD6FF',
  cardOverlay2: '#E6E1FF',
  cardOverlay3: '#F4F2FF',
} as const;

// =============================================
// 타이포그래피
// =============================================
export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

// =============================================
// 간격 & 크기
// =============================================
export const SPACING = {
  xs: wp(4),
  sm: wp(8),
  md: wp(16),
  lg: wp(24),
  xl: wp(32),
  xxl: wp(48),
} as const;

export const RADIUS = {
  sm: wp(8),
  md: wp(12),
  lg: wp(16),
  xl: wp(20),
  xxl: wp(24),
  full: wp(999),
} as const;

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} as const;
