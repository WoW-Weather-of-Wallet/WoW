import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: wp(28),
  },
  backButton: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(8),
    alignSelf: 'flex-start',
  },
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
    marginBottom: hp(24),
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(24),
    marginBottom: hp(20),
  },
  summaryCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: wp(18),
    paddingVertical: hp(16),
    marginBottom: hp(24),
    gap: hp(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(16),
  },
  summaryLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  summaryHint: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(18),
  },
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
  ssnBackText: {
    width: wp(30),
    textAlign: 'center',
  },
  ssnMasking: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: wp(4),
  },
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
  errorText: {
    marginTop: hp(8),
    textAlign: 'center',
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
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
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyContent: {
    flex: 1,
    paddingHorizontal: wp(28),
    paddingTop: hp(32),
  },
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
  keypadWrapper: {
    backgroundColor: COLORS.background,
  },
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
