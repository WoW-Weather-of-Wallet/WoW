import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.background,
    paddingVertical: hp(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(16),
  },
  cell: {
    flex: 1,
    height: hp(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: fp(28),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
});
