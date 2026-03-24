/**
 * WithdrawScreen 스타일 정의
 * PhoneAuthScreen · VerifyCodeScreen 과 동일한 디자인 언어를 사용합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  /* ── 기본 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },

  /* ── 뒤로가기 버튼 ── */
  backButton: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
    alignSelf: 'flex-start',
  },

  /* ── 제목 / 부제목 (PhoneAuthScreen 동일) ── */
  title: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(40),
    letterSpacing: -0.5,
    marginBottom: hp(8),
  },
  formSubtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(24),
    marginBottom: hp(28),
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(24),
    marginBottom: hp(20),
  },

  /* ── 입력 섹션 공통 ── */
  inputSection: {
    marginBottom: hp(24),
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
  bareText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },

  /* ── 주민번호 ── */
  ssnSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: hp(24),
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
  ssnBackInput: {
    width: wp(30),
    textAlign: 'center',
  },
  ssnMasking: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: wp(4),
  },

  /* ── 통신사 선택 ── */
  telecomSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
    minHeight: hp(50),
  },
  telecomText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textTertiary,
  },

  /* ── 탈퇴 경고 박스 ── */
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    backgroundColor: COLORS.dangerBackground,
    borderRadius: RADIUS.md,
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
  },
  warningText: {
    flex: 1,
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    lineHeight: fp(20),
  },

  /* ── 하단 버튼 공통 ── */
  bottomContainer: {
    paddingHorizontal: wp(28),
    paddingTop: hp(8),
    backgroundColor: COLORS.background,
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

  /* ── 탈퇴하기 버튼 (빨간색) ── */
  withdrawButton: {
    backgroundColor: COLORS.error,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },

  /* ── 인증 화면 본문 ── */
  verifyContent: {
    flex: 1,
    paddingHorizontal: wp(28),
    paddingTop: hp(32),
  },

  /* ── 인증번호 점(dot) 표시 (VerifyCodeScreen 동일) ── */
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(16),
    marginBottom: hp(24),
  },
  dot: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: COLORS.gray200,
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  dotError: {
    backgroundColor: COLORS.error,
  },

  /* ── 상태 피드백 영역 ── */
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    marginTop: hp(8),
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  successText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  errorText: {
    marginTop: hp(8),
    textAlign: 'center',
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },

  /* ── 키패드 래퍼 ── */
  keypadWrapper: {
    backgroundColor: COLORS.background,
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

  /* ── 인증번호 재발송 링크 ── */
  resendRow: {
    alignItems: 'center',
    marginTop: hp(6),
    marginBottom: hp(12),
  },
  resendText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
});
