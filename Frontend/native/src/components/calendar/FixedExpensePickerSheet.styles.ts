import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  searchInput: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: hp(18),
  },
  list: {
    gap: hp(4),
    marginBottom: hp(18),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(12),
    paddingVertical: hp(14),
  },
  rowSelected: {
    backgroundColor: COLORS.pickerRowSelectedBackground,
    borderWidth: 1,
    borderColor: COLORS.pickerRowSelectedBorder,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    flex: 1,
  },
  iconWrap: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  subtitle: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.spentRed,
  },
  confirmButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(16),
  },
  confirmButtonText: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
