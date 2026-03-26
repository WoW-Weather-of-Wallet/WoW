import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(20),
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: hp(32),
  },
  userName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: hp(4),
  },
  highlightExtraBold: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.extraBold,
  },
  userNameHighlight: {
    fontFamily: FONTS.extraBold,
    color: COLORS.primaryDark,
  },
  bottomSection: {
    marginTop: hp(10),
  },
});
