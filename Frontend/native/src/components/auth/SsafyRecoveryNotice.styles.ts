import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    marginTop: hp(24),
    paddingHorizontal: wp(4),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    padding: wp(16),
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: {
    marginRight: wp(10),
    marginTop: hp(2),
  },
  textWrapper: {
    flex: 1,
  },
  noticeText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(19),
    marginBottom: hp(6),
  },
  linkText: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
