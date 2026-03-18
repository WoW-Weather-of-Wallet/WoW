import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.fixedExpenseDetailSelectedBackground,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    marginBottom: hp(16),
  },
  selectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  iconWrap: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  selectedAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.spentRed,
  },
  aiHintCard: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.aiHintBackground,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    marginBottom: hp(18),
  },
  aiHintTitle: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.aiHintTitle,
  },
  aiHintText: {
    marginTop: hp(6),
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.aiHintText,
    lineHeight: fp(18),
  },
  sectionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    marginBottom: hp(18),
  },
  categoryChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
  },
  categoryChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.chipSelectedBackground,
  },
  categoryChipText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.primary,
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    marginBottom: hp(24),
  },
  stepperButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.stepperButtonBackground,
  },
  stepperButtonText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  stepperValue: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  submitButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(16),
  },
  submitButtonText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
