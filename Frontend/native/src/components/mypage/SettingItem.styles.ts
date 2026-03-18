import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  dangerLabel: {
    color: COLORS.limitRed,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginRight: wp(4),
  },
  chevron: {
    marginLeft: wp(4),
  },
});
