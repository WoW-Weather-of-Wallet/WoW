import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  sheetHeader: { marginBottom: hp(2) },
  introBox: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.spendingTypeIntro,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    marginBottom: hp(18),
  },
  introText: {
    fontSize: fp(15),
    lineHeight: fp(24),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  accent: { color: COLORS.primary, fontFamily: FONTS.bold },
  sheetSectionTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(14),
  },
  styleMapCard: {
    flexDirection: 'row',
    gap: wp(18),
    marginBottom: hp(20),
    alignItems: 'center',
  },
  styleLegend: { flex: 1, justifyContent: 'center' },
});
