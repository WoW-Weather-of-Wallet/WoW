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
  scheduleRight: { alignItems: 'flex-end', gap: hp(6) },
  scheduleAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
  },
  statusChipDone: {
    backgroundColor: COLORS.statusDoneBackground,
  },
  statusChipUpcoming: {
    backgroundColor: COLORS.statusWarningBackground,
  },
  statusChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
  },
  statusChipTextDone: {
    color: COLORS.statusDoneText,
  },
  statusChipTextUpcoming: {
    color: COLORS.statusWarningText,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(14),
    paddingVertical: hp(8),
  },
  emptyIconWrap: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary50,
  },
  emptyTextWrap: {
    flex: 1,
    gap: hp(4),
  },
  emptyTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  emptyDescription: {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
