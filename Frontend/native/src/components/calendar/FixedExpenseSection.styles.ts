import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const statusStyles = {
  done: { backgroundColor: COLORS.statusDoneBackground, color: COLORS.statusDoneText },
  countdown: { backgroundColor: COLORS.statusWarningBackground, color: COLORS.statusWarningText },
  pending: { backgroundColor: COLORS.backgroundSecondary, color: COLORS.textSecondary },
} as const;

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  pinEmoji: {
    fontSize: fp(17),
    lineHeight: fp(20),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  manageText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  totalLabel: {
    marginTop: hp(4),
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  list: {
    gap: hp(12),
  },
  groupBlock: {
    gap: hp(8),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.fixedExpenseRowBackground,
    paddingHorizontal: wp(14),
    paddingVertical: hp(14),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp(12),
  },
  iconWrap: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: hp(6),
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
  },
  statusText: {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
  },
  amount: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailPanel: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    gap: hp(10),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  detailTextBlock: {
    flex: 1,
    gap: hp(4),
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    flexWrap: 'wrap',
  },
  detailTitle: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailCategoryBadge: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary50,
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
  },
  detailCategoryBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  detailSubtitle: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  detailRight: {
    alignItems: 'flex-end',
    gap: hp(4),
  },
  detailAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailStatus: {
    fontSize: fp(11),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  emptyDetailText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
