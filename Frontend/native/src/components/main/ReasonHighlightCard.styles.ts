import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(12),
  },
  title: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  description: {
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});

export const toneStyles = {
  red: { backgroundColor: COLORS.reasonRedBackground },
  purple: { backgroundColor: COLORS.reasonPurpleBackground },
  green: { backgroundColor: COLORS.reasonGreenBackground },
} as const;
