import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(4),
    gap: wp(12),
  },
  scheduleTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  scheduleSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  scheduleRight: { alignItems: 'flex-end' },
  scheduleAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  scheduleStatus: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.warning,
  },
});
