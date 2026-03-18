import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: wp(16),
  },
  infoLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(8),
  },
  infoValue: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  infoChange: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
