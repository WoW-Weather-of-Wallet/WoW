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
  heroCard: {
    borderRadius: RADIUS.xxl,
    padding: wp(22),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  heroTop: { alignItems: 'flex-start', marginBottom: hp(18) },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  heroTitle: {
    fontSize: fp(27),
    lineHeight: fp(35),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  heroTitleHighlight: {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
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
  amountLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  amountValue: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  usageChip: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  },
  usageChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  progressTrack: {
    width: '100%',
    height: hp(10),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.progressTrackBackground,
    overflow: 'hidden',
    marginVertical: hp(14),
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  helperText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  forecastText: {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: hp(8),
  },
});
