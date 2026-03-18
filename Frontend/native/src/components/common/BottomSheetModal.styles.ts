import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
    width: '100%',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: wp(20),
    paddingTop: hp(18),
    maxHeight: '88%',
  },
  dragArea: {
    paddingBottom: hp(4),
  },
  scrollContent: {
    paddingBottom: hp(4),
  },
  handle: {
    width: wp(42),
    height: hp(6),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.modalHandle,
    alignSelf: 'center',
    marginBottom: hp(18),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: wp(12),
    marginBottom: hp(18),
  },
  closeOnlyRow: {
    alignItems: 'flex-end',
    marginBottom: hp(12),
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: hp(6),
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  closeButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
});
