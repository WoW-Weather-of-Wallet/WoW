import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    marginTop: hp(4),
  },
  sectionTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
    marginLeft: wp(18),
    marginBottom: hp(10),
    textTransform: 'uppercase',
  },
  content: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.separatorBorder,
  },
});
