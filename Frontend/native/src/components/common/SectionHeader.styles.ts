import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  title: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  action: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
