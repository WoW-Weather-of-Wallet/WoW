import { StyleSheet } from 'react-native';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(28),
  },
  title: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: wp(4),
  },
  allAgreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: wp(16),
    borderRadius: wp(12),
    marginBottom: hp(24),
  },
  allAgreeText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: wp(12),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginBottom: hp(24),
  },
  agreementsList: {
    maxHeight: hp(320),
    marginBottom: hp(24),
  },
  agreementsListContent: {
    gap: hp(20),
    paddingBottom: hp(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: wp(12),
  },
  rowText: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    flex: 1,
  },
  viewButton: {
    padding: wp(4),
    paddingLeft: wp(12),
  },
  viewText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.gray400,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    width: '100%',
    marginTop: hp(10),
  },
  confirmButton: {
    backgroundColor: COLORS.gray200,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  activeButtonText: {
    color: COLORS.white,
  },
});
