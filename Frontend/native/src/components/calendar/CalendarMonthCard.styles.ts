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
    // 첫째 주 시작점을 더 끌어올리기 위해 헤더 아래 간격을 없앱니다.
    marginBottom: 0,
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
    // 첫째 주만 당기면 균형이 깨져서 전체 주간 간격을 함께 조금 줄입니다.
    rowGap: hp(7),
    marginTop: -hp(2),
  },
  dayCell: {
    width: '14.28%',
    minHeight: hp(66),
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: RADIUS.lg,
    paddingVertical: hp(7),
    paddingTop: hp(7),
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
  memoBadge: {
    position: 'absolute',
    top: -hp(2),
    right: -wp(1),
    minWidth: wp(18),
    height: hp(18),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  memoBadgeSelected: {
    opacity: 0.92,
  },
  cellIndicator: {
    minHeight: hp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIndicatorPadding: {
    opacity: 0,
  },
  amountText: {
    minHeight: fp(11),
    fontSize: fp(9),
    fontFamily: FONTS.medium,
    color: COLORS.spentRed,
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
