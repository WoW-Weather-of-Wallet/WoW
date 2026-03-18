import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  flex1: { flex: 1 },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: wp(10) },
  iconBadge: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.aiBadgeBackground,
  },
  mainTitle: {
    fontSize: fp(24),
    lineHeight: fp(31),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    alignSelf: 'flex-start',
    backgroundColor: COLORS.aiBadgeBackground,
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(7),
  },
  aiBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  description: {
    marginTop: hp(14),
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
