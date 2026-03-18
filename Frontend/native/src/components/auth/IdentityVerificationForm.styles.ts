import { Platform, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  errorText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginTop: hp(12),
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingTop: hp(20),
  },
  confirmButton: {
    backgroundColor: COLORS.gray200,
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
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
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
