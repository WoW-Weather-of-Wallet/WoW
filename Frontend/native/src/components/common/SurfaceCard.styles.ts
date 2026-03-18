import { StyleSheet } from 'react-native';
import { COLORS, RADIUS, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(18),
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: hp(12),
  },
});
