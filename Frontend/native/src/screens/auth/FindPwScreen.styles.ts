import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  inputSection: {
    marginBottom: hp(24),
  },
  inputLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginBottom: hp(10),
    marginLeft: wp(4),
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
  helperText: {
    fontSize: fp(12),
    color: COLORS.textTertiary,
    marginTop: hp(6),
    marginLeft: wp(4),
  },

  /* ── 다음 단계 버튼 ── */
  idNextButton: {
    marginTop: hp(16),
    backgroundColor: COLORS.gray100,
    paddingVertical: hp(14),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  activeIdNextButton: {
    backgroundColor: COLORS.primary50,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  idNextButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  activeIdNextButtonText: {
    color: COLORS.primary,
  },

  /* ── 구분선 ── */
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: hp(24),
  },
  formWrapper: {
    flex: 1,
  },
});
