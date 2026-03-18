import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: hp(24),
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: hp(16),
  },
  avatarCircle: {
    width: wp(86),
    height: wp(86),
    borderRadius: wp(43),
    backgroundColor: COLORS.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fp(34),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  emailText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
});
