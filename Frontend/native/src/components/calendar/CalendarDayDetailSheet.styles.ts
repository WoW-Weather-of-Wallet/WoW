import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.calendarDayDetailBackground,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(14),
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  weatherLabel: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: hp(4),
  },
  weatherHint: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  temperature: {
    fontSize: fp(26),
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  metricRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginBottom: hp(18),
  },
  metricCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    padding: wp(16),
  },
  metricTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
    marginBottom: hp(6),
  },
  metricValue: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
  },
  metricSpent: {
    color: COLORS.spentRed,
  },
  metricCount: {
    color: COLORS.primary,
  },
  listSection: {
    marginBottom: hp(18),
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(10),
    gap: wp(10),
  },
  listTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  readonlyBadge: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
  },
  readonlyBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  emptyCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
  },
  emptyText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(10),
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  iconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  itemSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  itemAmount: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.spentRed,
  },
  memoSection: {
    marginBottom: hp(18),
  },
  memoTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  memoHint: {
    marginBottom: hp(10),
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(18),
  },
  memoInput: {
    minHeight: hp(108),
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  saveButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(16),
  },
  saveButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
