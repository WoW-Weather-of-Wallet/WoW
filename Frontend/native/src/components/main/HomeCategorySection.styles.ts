import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  categoryBlock: { gap: hp(8) },
  categoryTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  categoryAmount: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryBarTrack: {
    width: '100%',
    height: hp(8),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    overflow: 'hidden',
  },
  categoryBarFill: { height: '100%', borderRadius: RADIUS.full },
});
