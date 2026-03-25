import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalSpent: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.spentRed,
  },
  list: {
    gap: hp(16),
    marginTop: hp(18),
  },
  emptyCard: {
    marginTop: hp(18),
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.transactionBackground,
    paddingHorizontal: wp(18),
    paddingVertical: hp(24),
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: hp(10),
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptyDescription: {
    marginTop: hp(6),
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  groupBlock: {
    gap: hp(8),
  },
  groupLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.semiBold,
    color: COLORS.textTertiary,
  },
  groupCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.transactionBackground,
    paddingHorizontal: wp(14),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(13),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: hp(4),
  },
  itemTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  fixedPinEmoji: {
    fontSize: fp(12),
    lineHeight: fp(14),
  },
  itemCategory: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: hp(4),
  },
  amount: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.spentRed,
  },
  incomeAmount: {
    color: COLORS.incomeGreen,
  },
  time: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
});
