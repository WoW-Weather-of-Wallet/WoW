/**
 * SettingsScreen 스타일 정의
 * 사용자 설정 화면 — 프로필/비밀번호/휴대폰 수정 모달을 포함한 레이아웃을 관리합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  /* ── 헤더 ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56) + 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.gray100,
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },

  /* ── 스크롤 ── */
  scrollContent: {
    paddingBottom: hp(20),
  },

  /* ── 로딩 ── */
  loadingCard: {
    marginTop: hp(20),
    paddingVertical: hp(20),
    alignItems: 'center',
    gap: hp(10),
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 알림 토글 ── */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingBottom: hp(16),
    backgroundColor: COLORS.background,
    gap: wp(12),
  },
  toggleDescription: {
    flex: 1,
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 모달 ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    paddingHorizontal: wp(20),
  },
  modalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: wp(20),
    gap: hp(12),
  },
  pinModalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
    gap: hp(14),
  },
  modalTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  pinModalDescription: {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  pinIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(10),
    marginTop: hp(4),
  },
  pinIndicatorDot: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: COLORS.gray100,
  },
  pinIndicatorDotFilled: {
    backgroundColor: COLORS.primary,
  },

  /* ── 입력 필드 ── */
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  helperText: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 읽기 전용 필드 ── */
  readOnlyInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  readOnlyLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
  readOnlyValue: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  readOnlyHint: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: hp(4),
    paddingHorizontal: wp(4),
  },

  /* ── 인라인 액션 버튼 ── */
  inlineActionButton: {
    borderRadius: RADIUS.md,
    paddingVertical: hp(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  secondaryInlineActionButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifiedInlineActionButton: {
    backgroundColor: COLORS.success,
  },
  inlineActionText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  secondaryInlineActionText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },

  /* ── 모달 버튼 ── */
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(10),
    marginTop: hp(8),
  },
  secondaryButton: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  secondaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },

  /* ── 에러 메시지 ── */
  errorMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(8),
  },

  /* ── 비밀번호 입력 ── */
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputEyeIcon: {
    position: 'absolute',
    right: wp(12),
    padding: wp(4),
  },
});
