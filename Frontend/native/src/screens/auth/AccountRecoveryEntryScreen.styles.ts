/**
 * AccountRecoveryEntryScreen 스타일 정의
 * 계정 찾기 진입 화면 — 아이디/비밀번호 찾기 옵션 선택 레이아웃을 관리합니다.
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
    borderBottomWidth: 1,
    borderColor: COLORS.gray100,
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
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(24),
  },
  introContainer: {
    marginBottom: hp(32),
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
  optionsContainer: {
    gap: hp(8),
  },
});
