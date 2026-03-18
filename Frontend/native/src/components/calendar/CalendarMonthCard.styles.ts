import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const toneDotColors = {
  primary: COLORS.primary,
  mint: COLORS.dotMint,
  gold: COLORS.dotGold,
  rose: COLORS.dotRose,
} as const;

export const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(10),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  weekdaySunday: {
    color: COLORS.sundayRed,
  },
  weekdaySaturday: {
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: hp(10),
  },
  dayCell: {
    width: '14.28%',
    minHeight: hp(66),
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: RADIUS.lg,
    paddingVertical: hp(7),
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  dayCellFuture: {
    opacity: 0.72,
  },
  dayCellPadding: {
    opacity: 0,
  },
  dayNumber: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(5),
  },
  dayNumberSelected: {
    color: COLORS.textInverse,
  },
  dayNumberPadding: {
    color: 'transparent',
  },
  cellIndicator: {
    minHeight: hp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIndicatorPadding: {
    opacity: 0,
  },
  toneDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
  },
  toneDotSelected: {
    backgroundColor: COLORS.white,
  },
  amountText: {
    minHeight: fp(11),
    fontSize: fp(9),
    fontFamily: FONTS.medium,
    color: COLORS.amountGreen,
    marginTop: hp(5),
  },
  amountTextSelected: {
    color: COLORS.white,
  },
  amountTextPadding: {
    color: 'transparent',
  },
  todayRing: {
    position: 'absolute',
    top: hp(3),
    width: wp(29),
    height: wp(29),
    borderRadius: wp(14.5),
    borderWidth: 1,
    borderColor: COLORS.todayRingBorder,
  },
});
