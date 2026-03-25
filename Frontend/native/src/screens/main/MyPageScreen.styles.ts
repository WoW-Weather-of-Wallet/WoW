import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

/**
 * 마이페이지(MyPageScreen)의 스타일 정의입니다.
 * 사용자 프로필, 설정 섹션, 모달 및 보존된 레거시 UI의 레이아웃을 포함합니다.
 */
export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  profileDock: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(8),
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    gap: hp(10),
  },

  /* ── 프로필 헤더 ── */
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: wp(20),
    gap: hp(18),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // 다시 왼쪽 정렬로 복구
  },
  avatarCircle: {
    width: wp(68),
    height: wp(68),
    borderRadius: wp(34),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(16),
  },
  avatarText: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  profileTextBlock: {
    flex: 1, // 우측 공간을 모두 차지하게 함
    gap: hp(6),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileName: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  profileNameHighlight: {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  },
  profileBadge: {
    backgroundColor: COLORS.primary + '15', // very light primary
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
  },
  profileBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  profileLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginTop: hp(10),
  },
  profileLoadingText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── [LEGACY] 스타일 보존 ── */
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(14),
    paddingHorizontal: wp(18),
  },
  profileSummaryItem: {
    flex: 1,
  },
  profileSummaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  profileSummaryValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  profileDivider: {
    width: 1,
    height: hp(34),
    backgroundColor: COLORS.border,
    marginHorizontal: wp(16),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(18),
    paddingHorizontal: wp(14),
  },
  statValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  statLabel: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: wp(16),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(12),
  },
  sectionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  emptyStateCard: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(18),
    paddingVertical: hp(20),
    gap: hp(8),
  },
  emptyStateTitle: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  /* ── 설정 및 모달 ── */
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
  modalTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  modalDescription: {
    fontSize: fp(13),
    lineHeight: fp(20),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(2),
  },
  
  /* ── 입력 및 필드 ── */
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  readOnlyInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  /* ── 하이퍼링크 guidance ── */
  hyperlinkContainer: {
    marginTop: hp(12),
    padding: wp(12),
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  hyperlinkText: {
    fontSize: fp(13),
    lineHeight: fp(20),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  hyperlinkAction: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },

  /* ── 모달 버튼 ── */
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(10),
    marginTop: hp(8),
  },
  primaryButton: {
    flex: 1,
    paddingVertical: hp(14),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: hp(14),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },

  /* ── PIN 모달 전용 ── */
  pinModalCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: wp(20),
    gap: hp(14),
  },
  pinModalDescription: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  pinIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(10),
    marginVertical: hp(10),
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

  /* ── 패스워드 입력 필드 ── */
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

  /* ── 유틸리티 ── */
  errorMessage: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    textAlign: 'center',
  },
});
