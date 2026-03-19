import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(20),
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  grantedCard: {
    borderColor: COLORS.primary50,
    backgroundColor: COLORS.primary50,
  },
  unsupportedCard: {
    opacity: 0.5,
    backgroundColor: COLORS.backgroundSecondary,
  },
  iconCircle: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(16),
  },
  permissionCopy: {
    flex: 1,
    paddingRight: wp(8),
  },
  permissionTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(2),
  },
  grantedText: {
    color: COLORS.primary,
  },
  permissionDescription: {
    fontSize: fp(12),
    lineHeight: fp(17),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleEmpty: {
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  checkCircleGranted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
});
