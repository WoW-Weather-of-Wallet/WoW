import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  sectionList: {
    gap: hp(12),
  },
  section: {
    gap: hp(8),
  },
  sectionTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  chip: {
    minWidth: wp(78),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(12),
  },
  card: {
    width: '31%',
    minHeight: hp(84),
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hp(8),
    paddingHorizontal: wp(8),
    paddingVertical: hp(12),
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary50,
  },
  cardText: {
    fontSize: fp(12),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardTextActive: {
    color: COLORS.primary,
  },
});
