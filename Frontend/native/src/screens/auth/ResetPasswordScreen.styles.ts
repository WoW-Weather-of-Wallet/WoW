import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  formContainer: {
    gap: hp(24),
  },
  inputWrapper: {
    width: '100%',
  },
  errorText: {
    fontSize: fp(12),
    color: COLORS.error,
    marginTop: hp(6),
    marginLeft: wp(4),
    fontFamily: FONTS.medium,
  },

  /* ── 하단 버튼 ── */
  footer: {
    marginTop: hp(60),
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray100,
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  disabledButtonText: {
    color: COLORS.textTertiary,
  },
});
