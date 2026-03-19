/**
 * AccessPermissionScreen 스타일 정의
 * 앱 접근 권한 설정 화면의 레이아웃을 관리합니다.
 * 필수/선택 권한 카드 목록 및 하단 확인 버튼을 포함합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(24),
  },
  scrollContent: {
    paddingBottom: hp(40),
  },

  /* ── 타이틀 ── */
  titleContainer: {
    marginTop: hp(40),
    marginBottom: hp(32),
  },
  titleText: {
    fontSize: fp(26),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(36),
    letterSpacing: -0.6,
  },
  subtitleText: {
    marginTop: hp(12),
    fontSize: fp(15),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 권한 섹션 ── */
  sectionContainer: {
    width: '100%',
  },
  marginTop24: {
    marginTop: hp(24),
  },
  sectionHeader: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: hp(12),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  listContainer: {
    gap: hp(12),
  },

  /* ── 하단 ── */
  footer: {
    marginTop: hp(40),
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
    marginBottom: hp(24),
  },
  refreshText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  buttonGap: {
    gap: hp(12),
  },
  retryButton: {
    paddingVertical: hp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
});
