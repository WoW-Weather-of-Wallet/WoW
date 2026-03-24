import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    paddingHorizontal: wp(24),
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: wp(24),
    gap: hp(24),
  },
  header: {
    alignItems: 'center',
    gap: hp(12),
  },
  warningIconContainer: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: COLORS.dangerBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(22),
  },
  inputSection: {
    gap: hp(12),
  },
  inputLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.noticeBoxBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: hp(14),
    paddingHorizontal: wp(16),
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  inputActive: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.dangerBackground,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: hp(16),
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: hp(16),
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    backgroundColor: COLORS.switchTrackFalse,
  },
  /* ── 추가된 스타일 ── */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: wp(12),
    padding: wp(4),
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(4),
    marginLeft: wp(4),
  },
  /* ── SMS 인증번호 발송 버튼 ── */
  sendCodeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(14),
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  sendCodeButtonText: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  /* ── 인증 완료 안내 텍스트 ── */
  verifiedText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: hp(4),
  },
});
