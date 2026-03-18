import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    gap: hp(10),
  },
  dividerContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: hp(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  dot: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  label: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  value: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
  },
});
