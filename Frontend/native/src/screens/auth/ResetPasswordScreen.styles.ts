/**
 * ResetPasswordScreen 스타일 정의
 * 비밀번호 재설정 화면 — 새 비밀번호 입력 폼의 레이아웃을 관리합니다.
 * 모든 색상은 theme.ts 디자인 토큰을 참조합니다.
 */
import { StyleSheet } from 'react-native';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';

export const styles = StyleSheet.create({
  /* ── 레이아웃 ── */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ── 헤더 ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56),
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },

  /* ── 본문 ── */
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(24), // 기본 여백을 줄이고 동적 여백으로 처리
  },

  /* ── 안내 문구 ── */
  introContainer: {
    marginBottom: hp(40),
  },
  introTitle: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(34),
    marginBottom: hp(8),
  },
  introSub: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },

  /* ── 폼 ── */
  formContainer: {
    gap: hp(24),
  },
  inputWrapper: {
    width: '100%',
  },
  errorText: {
    fontSize: fp(12),
    color: COLORS.error,
    marginTop: hp(6),
    marginLeft: wp(4),
    fontFamily: FONTS.medium,
  },

  /* ── 하단 버튼 ── */
  footer: {
    marginTop: hp(60),
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray100,
  },
  mainButtonText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  disabledButtonText: {
    color: COLORS.textTertiary,
  },
});
