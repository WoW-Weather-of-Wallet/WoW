/**
 * LoginScreen 스타일 정의
 * 로그인 화면의 전체 레이아웃과 폼, 소셜 로그인 등을 관리합니다.
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(28),
    paddingTop: hp(80),
    paddingBottom: hp(40),
  },

  /* ── 헤더 ── */
  headerContainer: {
    alignItems: 'center',
    marginBottom: hp(32),
  },
  headerTitle: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerLine: {
    width: wp(40),
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: hp(12),
  },

  /* ── 개발용 진입 카드 ── */
  /* ── 로그인 폼 ── */
  formContainer: {
    marginBottom: hp(8),
  },
  inputSpacing: {
    marginBottom: hp(14),
  },
  errorText: {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.error,
    marginBottom: hp(10),
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: hp(8),
  },
  buttonHalf: {
    flex: 1,
  },
  buttonGap: {
    width: wp(12),
  },
  loadingRow: {
    alignItems: 'center',
    marginTop: hp(14),
  },

  /* ── 계정 찾기 / 자동 로그인 ── */
  findAccountButton: {
    alignItems: 'center',
    paddingVertical: hp(16),
  },
  findAccountText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 구분선 ── */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: wp(16),
    fontSize: fp(13),
    fontFamily: FONTS.regular,
    color: COLORS.textTertiary,
  },

  /* ── SSAFY 소셜 로그인 ── */
  ssafyButton: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  ssafyGradient: {
    paddingVertical: hp(18),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
  },
  ssafyButtonText: {
    color: COLORS.textInverse,
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
});
