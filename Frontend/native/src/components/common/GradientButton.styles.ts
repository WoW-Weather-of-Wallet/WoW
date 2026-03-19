import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  solidButton: {
    paddingVertical: hp(16),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidText: {
    color: COLORS.textInverse,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
  outlineButton: {
    paddingVertical: hp(16),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  outlineText: {
    color: COLORS.textPrimary,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
});
