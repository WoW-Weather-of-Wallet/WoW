import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(20),
    paddingVertical: hp(4),
  },
  input: {
    fontSize: fp(15),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: hp(14),
  },
});
