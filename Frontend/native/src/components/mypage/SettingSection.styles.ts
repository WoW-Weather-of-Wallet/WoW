import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
  },
  sectionTitle: {
    fontSize: fp(13),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
    marginLeft: wp(22),
    marginBottom: hp(8),
    textTransform: 'uppercase',
  },
  content: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.separatorBorder,
  },
});
