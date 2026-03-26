import { StyleSheet } from 'react-native';
import { COLORS, FONTS, hp, RADIUS, wp, fp } from '../../constants/theme';

/**
 * CreateAccountScreen에서 사용하는 레이아웃 상수입니다.
 * 기기별 안전 영역(insets)과 결합하여 동적인 여백을 계산할 때 사용됩니다.
 */
export const CONSTANTS = {
  scrollContentPaddingTop: hp(20),
  scrollContentPaddingBottom: hp(40),
  bottomContainerPaddingBottom: hp(20),
  checkButtonIconSize: wp(20),
  eyeIconSize: wp(22),
} as const;

/**
 * 회원가입 화면의 스타일 정의입니다.
 * 테마(theme.ts)의 디자인 토큰을 참조하여 일관된 유아이를 유지합니다.
 */
export const styles = StyleSheet.create({
  inputSection: {
    marginBottom: hp(32),
  },
  idInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  idInputUnderline: {
    flex: 1,
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.textPrimary,
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
  },
  bareInput: {
    fontSize: fp(20),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  bareInputLetterSpacing: {
    letterSpacing: 1,
  },
  eyeIcon: {
    padding: wp(4),
  },
  checkButton: {
    paddingHorizontal: wp(16),
    height: hp(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    marginBottom: hp(4),
  },
  checkButtonInactive: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  checkButtonActive: {
    backgroundColor: COLORS.textPrimary,
  },
  checkButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  checkButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  successMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.success,
    marginTop: hp(8),
  },
  fixedLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginBottom: hp(10),
  },
  fixedValueBox: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(18),
    paddingVertical: hp(16),
    gap: hp(8),
  },
  fixedValueText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  fixedHintText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(8),
  },
  guideMessage: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginTop: hp(8),
  },
  submitErrorText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(4),
  },
  confirmButton: {
    backgroundColor: COLORS.border,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.textPrimary,
  },
  confirmButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  activeButtonText: {
    color: COLORS.textInverse,
  },
});
