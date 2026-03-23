import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  previewStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(10),
    paddingVertical: hp(12),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  previewDayColumn: { alignItems: 'center', flex: 1, gap: hp(3) },
  previewWeekday: { fontSize: fp(10), fontFamily: FONTS.bold, color: COLORS.textTertiary },
  previewWeekdaySunday: { color: COLORS.sundayRed },
  previewWeekdaySaturday: { color: COLORS.primary },
  previewDayNumber: { fontSize: fp(16), fontFamily: FONTS.bold, color: COLORS.textPrimary },
  previewPlaceholder: { height: hp(14) },
  previewAmount: { fontSize: fp(10), fontFamily: FONTS.medium, color: COLORS.amountGreen },
});
