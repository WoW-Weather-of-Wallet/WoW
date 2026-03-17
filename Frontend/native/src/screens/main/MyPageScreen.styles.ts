import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

/**
 * 마이페이지(MyPageScreen)의 스타일 정의입니다.
 * 사용자 프로필, 보유 계좌, 카드 정보 및 바로가기 메뉴의 레이아웃을 포함합니다.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    gap: hp(18),
  },
  profileCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(20),
    gap: hp(18),
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: wp(68),
    height: wp(68),
    borderRadius: wp(34),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(16),
  },
  avatarText: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  profileTextBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary50,
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  profileBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(14),
    paddingHorizontal: wp(18),
  },
  profileSummaryItem: {
    flex: 1,
  },
  profileSummaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  profileSummaryValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  profileDivider: {
    width: 1,
    height: hp(34),
    backgroundColor: COLORS.border,
    marginHorizontal: wp(16),
  },
  profileLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  profileLoadingText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(18),
    paddingHorizontal: wp(14),
  },
  statValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  statLabel: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(18),
    gap: hp(14),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  creditCard: {
    borderRadius: RADIUS.xxl,
    paddingHorizontal: wp(18),
    paddingTop: hp(18),
    paddingBottom: hp(16),
    marginBottom: hp(12),
  },
  creditCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(32),
  },
  creditCardType: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.cardOverlay1,
    marginBottom: hp(6),
  },
  creditCardName: {
    fontSize: fp(21),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  creditCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardNumber: {
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
    marginBottom: hp(6),
    letterSpacing: 0.6,
  },
  creditCardOwner: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.cardOverlay2,
  },
  creditCardBilling: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.cardOverlay3,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(14),
    paddingVertical: hp(14),
    marginBottom: hp(10),
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: wp(10),
  },
  accountIconCircle: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  accountTonePrimary: {
    backgroundColor: COLORS.accentPrimaryLight,
  },
  accountToneMint: {
    backgroundColor: COLORS.accentMintLight,
  },
  accountToneGold: {
    backgroundColor: COLORS.accentGoldLight,
  },
  accountTextBlock: {
    flex: 1,
  },
  accountBankName: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  accountAlias: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginBottom: hp(4),
  },
  accountNumber: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  accountBalanceLabel: {
    fontSize: fp(11),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(6),
  },
  shortcutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: wp(12),
  },
  shortcutIconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: COLORS.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  shortcutTextBlock: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  shortcutDescription: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  actionButtonSpacing: {
    marginBottom: hp(10),
  },
});
