import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  previewStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: wp(20),
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(10),
    paddingVertical: hp(12),
  },
  previewDayColumn: { alignItems: 'center', flex: 1, gap: hp(3) },
  previewWeekday: { fontSize: fp(10), fontFamily: FONTS.bold, color: COLORS.textTertiary },
  previewWeekdaySunday: { color: COLORS.sundayRed },
  previewWeekdaySaturday: { color: COLORS.primary },
  previewDayNumber: { fontSize: fp(16), fontFamily: FONTS.bold, color: COLORS.textPrimary },
  previewPlaceholder: { height: hp(14) },
  previewAmount: { fontSize: fp(10), fontFamily: FONTS.medium, color: COLORS.amountGreen },
});
