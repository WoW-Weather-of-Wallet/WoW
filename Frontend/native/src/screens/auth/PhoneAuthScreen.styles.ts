/**
 * PhoneAuthScreen 스타일 정의
 * 본인인증(이름·주민번호·통신사·연락처) 입력 화면의 레이아웃을 관리합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

/* ───────────────────────────────────────────────
 * 숫자 상수 (StyleSheet 외부에서 사용하는 반응형 값)
 * ─────────────────────────────────────────────── */
export const CONSTANTS = {
  /** ScrollView 상단 여백 (insets.top 과 결합) */
  scrollContentPaddingTop: hp(60),
  /** ScrollView 하단 여백 (insets.bottom 과 결합) */
  scrollContentPaddingBottom: hp(40),
  /** 하단 확인 버튼 영역 최소 여백 */
  bottomMinPadding: hp(24),
  /** 통신사 선택 아이콘 크기 */
  chevronIconSize: wp(24),
  /** 주민번호 뒤 1자리 입력란 너비 */
  ssnBackInputWidth: wp(30),
} as const;

/* ───────────────────────────────────────────────
 * 스타일시트
 * ─────────────────────────────────────────────── */
export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },

  /* ── 타이틀 ── */
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(40),
    marginBottom: hp(40),
    letterSpacing: -0.5,
  },

  /* ── 입력 섹션 공통 ── */
  inputSection: {
    marginBottom: hp(32),
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  bareInput: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },

  /* ── 주민번호 ── */
  ssnSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: hp(32),
  },
  dash: {
    fontSize: fp(20),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    marginHorizontal: wp(12),
    marginBottom: hp(16),
  },
  ssnBackContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ssnMasking: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: wp(6),
    marginTop: Platform.OS === 'ios' ? hp(4) : 0,
  },

  /* ── 통신사 선택 ── */
  telecomSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
  },
  telecomText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textTertiary,
  },

  /* ── 에러 메시지 ── */
  errorText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(12),
  },

  /* ── 하단 확인 버튼 ── */
  bottomContainer: {
    paddingHorizontal: wp(28),
    backgroundColor: COLORS.background,
    paddingTop: hp(12),
  },
  confirmButton: {
    backgroundColor: COLORS.border,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  activeButtonText: {
    color: COLORS.textInverse,
  },

  /* ── 통신사 선택 모달 ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(16),
  },
  modalHeader: {
    marginBottom: hp(16),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  modalItem: {
    paddingVertical: hp(18),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalItemText: {
    fontSize: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
