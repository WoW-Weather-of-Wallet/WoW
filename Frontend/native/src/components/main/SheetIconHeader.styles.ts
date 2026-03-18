import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(14),
  },
  iconWrap: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.sheetIconBackground,
  },
  textBlock: { flex: 1 },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
});
