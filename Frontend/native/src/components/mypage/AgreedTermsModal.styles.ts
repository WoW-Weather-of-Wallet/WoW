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
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(16),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: wp(4),
  },
  description: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    lineHeight: fp(22),
    marginBottom: hp(18),
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.noticeBoxBackground,
    borderRadius: RADIUS.md,
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    marginBottom: hp(12),
  },
  toolbarText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  toolbarLink: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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
    gap: wp(12),
  },
  termLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: wp(12),
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
  termMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  termDate: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  requiredBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
    borderRadius: RADIUS.sm,
  },
  requiredBadgeText: {
    fontSize: fp(11),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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
  actionRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginTop: hp(24),
  },
  secondaryButton: {
    flex: 1,
    borderRadius: RADIUS.full,
    paddingVertical: hp(18),
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  secondaryButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1.4,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray200,
  },
  confirmButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
});
