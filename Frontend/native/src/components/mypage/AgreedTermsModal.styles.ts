import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(40),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: wp(4),
  },
  scrollContent: {
    gap: hp(16),
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separatorBorder,
  },
  termInfo: {
    flex: 1,
    gap: hp(4),
  },
  termTitle: {
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  termDate: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: COLORS.separatorBorder,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
    borderRadius: RADIUS.sm,
  },
  viewText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  noticeBox: {
    backgroundColor: COLORS.noticeBoxBackground,
    borderRadius: RADIUS.md,
    padding: wp(16),
    marginTop: hp(8),
  },
  noticeText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(20),
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: hp(18),
    alignItems: 'center',
    marginTop: hp(32),
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});
