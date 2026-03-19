import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  heroCard: {
    borderRadius: RADIUS.xxl,
    paddingHorizontal: wp(16),
    paddingTop: hp(16),
    paddingBottom: hp(18),
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  screenTitle: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  addButton: {
    borderWidth: 1,
    borderColor: COLORS.whiteOverlay3A,
    backgroundColor: COLORS.whiteOverlay14,
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
  },
  addButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    marginBottom: hp(16),
  },
  monthArrow: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: COLORS.whiteOverlay22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteOverlay14,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    marginBottom: hp(16),
  },
  weatherIconWrap: {
    width: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(10),
  },
  weatherTextBlock: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: fp(17),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: hp(4),
  },
  weatherHint: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.calendarHeroSubText,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.calendarHeroLabel,
    marginBottom: hp(6),
  },
  summaryAmount: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: COLORS.whiteOverlay1E,
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(14),
    paddingVertical: hp(9),
  },
  goalBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
