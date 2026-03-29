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

export const LAYOUT = {
  // Root screen spacing uses stable dp values to reduce device-height wobble.
  pageHorizontal: 20,
  pageHorizontalNarrow: 16,
  pageSectionGap: 18,
  pageSectionGapCompact: 14,
  scrollTopPadding: 12,
  scrollTopPaddingCompact: 10,
  scrollBottomPadding: 30,
  scrollBottomPaddingCompact: 24,
  topDockTopPadding: 12,
  topDockTopPaddingCompact: 10,
  topDockBottomPadding: 4,
  tabBarHeight: 58,
  tabBarTopPadding: 6,
  tabBarBottomPadding: 6,
  tabBarItemPaddingVertical: 2,
  tabBarLabelMarginTop: 2,
  tabBarIconMarginTop: 1,
  tabBarIconBoxSize: 34,
  bottomSheetHorizontal: 20,
  bottomSheetTopPadding: 18,
  bottomSheetBottomPadding: 18,
  bottomSheetHeaderGap: 18,
  bottomSheetHandlePaddingHorizontal: 18,
  bottomSheetHandlePaddingVertical: 10,
  bottomSheetHandleWidth: 42,
  bottomSheetHandleHeight: 6,
  bottomSheetCloseButtonSize: 34,
  bottomSheetCloseIconSize: 18,
} as const;

// =============================================
// 색상 팔레트
// =============================================
export const COLORS = {
  // 메인 테마 컬러
  primary: '#7363DD',
  primaryLight: '#8B74EA',
  primaryDark: '#5B4BC4',
  primarySoft: '#EDE8FF',
  primary50: '#F7F4FF',

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
  borderFocus: '#7363DD',
  surfaceBorder: '#D9D7FF',

  // 상태
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // 그라데이션
  gradientStart: '#8B74EA',
  gradientEnd: '#7363DD',

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
  accentPrimaryLight: '#EDE8FF',
  accentMintLight: '#D7F4E9',
  accentGoldLight: '#F9EAC5',
  cardOverlay1: '#E3E1FF',
  cardOverlay2: '#EEEBFF',
  cardOverlay3: '#F7F6FF',

  // SSAFY 로그인 그라데이션 (추가)
  blue500: '#3B82F6',
  blue600: '#2563EB',

  // Switch 비활성 상태 컬러 (추가)
  switchThumbInactive: '#F4F3F4',

  // 모달 오버레이 (추가)
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  modalOverlaySoft: 'rgba(15, 23, 42, 0.45)',

  // 모달 핸들 (추가)
  modalHandle: '#E1DEEF',

  // 홈 예산 카드 관련 (추가)
  budgetGradientStart: '#F7F6FF',
  budgetGradientEnd: '#EEEBFF',
  aiBadgeBackground: '#EEEBFF',
  progressTrackBackground: '#D9D7FF',

  // 차트 및 리포트 관련 (추가)
  chartRed: '#E97975',
  chartBlue: '#7D8DF1',
  chartYellow: '#F3B84D',
  chartGreen: '#86D5D0',
  chartRedMuted: '#F0A6A6',
  chartBlueMuted: '#A9B4F8',
  chartYellowMuted: '#F5D5A1',
  chartGreenMuted: '#B8E4E2',
  
  // 인사이트 카드 관련 (추가)
  insightBackground: '#FFF5E8',
  insightText: '#A86A18',
  mutedBackground: '#F1F2F6',
  spendingTypeIntro: '#F7F6FF',

  // 주간 예보 및 기타 (추가)
  sundayRed: '#E17272',
  amountGreen: '#6FC48A',

  // 사유 카드 유형별 배경 (추가)
  reasonRedBackground: '#FFF1F0',
  reasonPurpleBackground: '#EEEBFF',
  reasonGreenBackground: '#F1FAEA',

  // 시트 아이콘 헤더 배경 (추가)
  sheetIconBackground: '#EEEBFF',

  // 레이더 차트 전용 (추가)
  radarGridOuter: '#D9D7FF',
  radarGridInner: '#EEEBFF',
  radarAxis: '#E3E1FF',
  radarFill: '#7363DD26',

  // 캘린더 히어로 관련 (추가)
  calendarHeroStart: '#7363DD',
  calendarHeroEnd: '#AE70E0',
  whiteOverlay14: '#FFFFFF14',
  whiteOverlay1E: '#FFFFFF1E',
  whiteOverlay22: '#FFFFFF22',
  whiteOverlay3A: '#FFFFFF3A',
  calendarHeroSubText: '#F3EDFF',
  calendarHeroLabel: '#F8F4FF',
  weatherSun: '#FFC94D',

  // 캘린더 월간 그리드 관련 (추가)
  dotMint: '#7DD3A7',
  dotGold: '#E2BE63',
  dotRose: '#E97975',
  todayRingBorder: '#D9D7FF',

  // 캘린더 상세 및 탭 관련 (추가)
  calendarDayDetailBackground: '#EEEBFF',
  spentRed: '#D87272',
  tabSwitcherBackground: '#F5F4FA',

  // 고정지출 및 거래내역 관련 (추가)
  statusDoneBackground: '#EFF9EE',
  statusDoneText: '#7CB66C',
  statusWarningBackground: '#FFF7E7',
  statusWarningText: '#D2A446',
  fixedExpenseRowBackground: '#F8F7FF',
  transactionBackground: '#FBFAFF',
  incomeGreen: '#6DBA7C',

  // 고정지출 상세 및 피커 관련 (추가)
  fixedExpenseDetailSelectedBackground: '#EEEBFF',
  aiHintBackground: '#FFF8E9',
  aiHintTitle: '#B5851B',
  aiHintText: '#AB832B',
  chipSelectedBackground: '#F0EEFF',
  stepperButtonBackground: '#EEEBFF',
  pickerRowSelectedBackground: '#EEEBFF',
  pickerRowSelectedBorder: '#D9D7FF',

  // 고정지출 관리 관련 (추가)
  headerButtonBackground: '#FFFFFF1E',
  fixedExpenseSummaryBackground: '#8B74EA',
  summaryTextLight: '#ECEAFF',
  summaryTextHint: '#F4F3FF',
  addButtonBackground: '#FFFFFF26',
  deleteChipBackground: '#FDECEC',

  // 캘린더 항목 추가 관련 (추가)
  addEntryTabBackground: '#F6F5FB',
  inputBorder: '#E3E1F0',
  draftCardBackground: '#F7F6FF',
  draftBadgeBackground: '#E3E1FF',
  chipBorder: '#DDD9F2',
  secondaryButtonBorder: '#E6E2F3',
  secondaryButtonDisabled: '#FAFAFC',
  excelIconGold: '#B08A5B',
  bankChipBackground: '#EEEBFF',
  uploadBoxBorder: '#D0CBFF',
  uploadBoxBackground: '#FCFBFF',
  noticeBackground: '#FFF8E8',
  noticeText: '#8C6A2D',
  errorBackground: '#FFF2F2',
  successGreen: '#66B677',
  warningOrange: '#D5893E',
  classifiedBadgeBackground: '#EAF6E4',
  classifiedBadgeText: '#7AA55A',
  needsCategoryBackground: '#FFF1DA',
  resultIconBackground: '#EEEBFF',
  resultDivider: '#E7E5FF',

  // 마이페이지/설정 관련 (추가)
  limitRed: '#EF4444', // Danger/Withdrawal red
  switchTrackFalse: '#E5E7EB',
  separatorBorder: '#F3F4F6',
  noticeBoxBackground: '#F9FAFB',
  dangerBackground: '#FEF2F2',
} as const;

// =============================================
// 타이포그래피
// =============================================
export const FONTS = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
  black: 'Pretendard-Black',

  // 폰트 단일화를 위해 mono, serif도 Pretendard로 매핑 (User Request V5)
  mono: 'Pretendard-Regular',
  monoMedium: 'Pretendard-Medium',
  monoSemiBold: 'Pretendard-SemiBold',
  monoBold: 'Pretendard-Bold',

  serif: 'Pretendard-Regular',
  serifMedium: 'Pretendard-Medium',
  serifSemiBold: 'Pretendard-SemiBold',
  serifBold: 'Pretendard-Bold',
} as const;

export const TYPOGRAPHY = {
  caption: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  label: {
    fontSize: fp(14),
    lineHeight: fp(20),
  },
  body: {
    fontSize: fp(14),
    lineHeight: fp(22),
  },
  bodyStrong: {
    fontSize: fp(15),
    lineHeight: fp(22),
  },
  title: {
    fontSize: fp(18),
    lineHeight: fp(24),
  },
  heroSection: {
    fontSize: fp(22),
    lineHeight: fp(30),
  },
  heroMeta: {
    fontSize: fp(16),
    lineHeight: fp(22),
  },
  heroTitle: {
    fontSize: fp(28),
    lineHeight: fp(36),
  },
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
