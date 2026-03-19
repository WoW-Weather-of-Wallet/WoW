/**
 * AccountRecoveryResultScreen 스타일 정의
 * 계정 찾기 결과 화면 — 성공/실패 분기별 결과 표시 레이아웃을 관리합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: hp(56),
    justifyContent: 'center',
    paddingHorizontal: wp(16),
  },
  backButton: {
    padding: wp(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(24),
    alignItems: 'center',
    paddingTop: hp(40),
  },

  /* ── 아이콘 ── */
  iconWrapper: {
    marginBottom: hp(32),
  },
  iconCircle: {
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleNone: {
    backgroundColor: COLORS.gray100,
  },

  /* ── 텍스트 ── */
  textSection: {
    alignItems: 'center',
    marginBottom: hp(48),
  },
  title: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(24),
  },

  /* ── 결과 박스 ── */
  resultBox: {
    width: '100%',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    padding: wp(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  resultValue: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },

  /* ── SSAFY 안내 박스 ── */
  noticeBox: {
    width: '100%',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.xl,
    padding: wp(24),
  },
  noticeText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
  },
  highlight: {
    color: COLORS.primary,
  },
  noticeSubText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(22),
    marginBottom: hp(20),
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: wp(4),
    textDecorationLine: 'underline',
  },

  /* ── 빈 결과 ── */
  emptyBox: {
    width: '100%',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(24),
  },

  /* ── 하단 버튼 ── */
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: hp(24),
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(20),
    gap: wp(8),
  },
  secondaryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
});
